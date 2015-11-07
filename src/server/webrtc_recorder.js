// Last time updated at July 07, 2014, 19:21:23

// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Experiments    - github.com/muaz-khan/WebRTC-Experiment
// RecordRTC      - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC

// RecordRTC over Socket.io - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-over-Socketio
import uuid from 'node-uuid';
import path from 'path';
import fs from 'fs';
import FFmpeg from 'fluent-ffmpeg';

let shouldRecord = false;

function writeToDisk(dataURL, fileName) {
  const fileExtension = fileName.split('.').pop();
  const fileRootNameWithBase = path.join(process.env.PWD, 'uploads', fileName);
  const fileBuffer = new Buffer(dataURL.split(',').pop(), 'base64');
  let filePath = fileRootNameWithBase;
  let fileID = 2;

  // @todo return the new filename to client
  while (fs.existsSync(filePath)) {
    filePath = `${fileRootNameWithBase}(${fileID})${fileExtension}`;
    fileID += 1;
  }

  fs.writeFileSync(filePath, fileBuffer);

  console.log('filePath', filePath);
}

function merge(socket, fileName) {
  const audioFile = path.join(__dirname, 'uploads', fileName + '.wav');
  const videoFile = path.join(__dirname, 'uploads', fileName + '.webm');
  const mergedFile = path.join(__dirname, 'uploads', fileName + '-merged.webm');

  new FFmpeg({ source: videoFile })
    .addInput(audioFile)
    .on('error', (err) => socket.emit('ffmpeg-error', 'ffmpeg : An error occurred: ' + err.message))
    .on('progress', (progress) => socket.emit('ffmpeg-output', Math.round(progress.percent)))
    .on('end', () => {
      socket.emit('merged', fileName + '-merged.webm');
      console.log('Merging finished !');

      // removing audio/video files
      fs.unlink(audioFile);
      fs.unlink(videoFile);
    })
    .saveToFile(mergedFile);
}

const client = {
  record(state) {
    shouldRecord = state;
  },
  init(io) {
    io.sockets.on('connection', (socket) => {
      socket.on('message', (data) => {
        if (!shouldRecord) {
          return;
        }
        const fileName = uuid.v4();

        socket.emit('ffmpeg-output', 0);

        writeToDisk(data.audio.dataURL, fileName + '.wav');

        if (data.video) {
          writeToDisk(data.video.dataURL, fileName + '.webm');
          merge(socket, fileName);
        } else {
          socket.emit('merged', fileName + '.wav');
        }
      });
    });
  },
};

export default client;
