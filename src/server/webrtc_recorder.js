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

var keys = require('./keys.js');

let CLIENT_ID = keys.CLIENT_ID;
let CLIENT_SECRET = keys.CLIENT_SECRET;
let REDIRECT_URL = keys.REDIRECT_URL;

var googleapis = require('googleapis');
var OAuth2 = googleapis.auth.OAuth2;               
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

function uploadToYoutube(title, desc, videoPath) {
  googleapis.youtube({version: 'v3', auth: googleOauth2Client}).execute(function(err, client) {

    console.log('Creating metadata');

    var metadata = {
        snippet: { title: title, description: desc}, 
        status: { privacyStatus: 'private' }
    };

    console.log('Creating client for youtube upload');
    client
        .youtube.videos.insert({ part: 'snippet, status'}, metadata)
        .withMedia('video/webm', fs.readFileSync(videoPath))
        .execute(function(err, result) {
            if (err) {
              console.log('Youtube upload failed');
              console.error(err);
            }
            else {
                console.log('Uploaded successfully');
                console.log(JSON.stringify(result, null, '  '));
            }
        });
  });
}

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
  const audioFile = path.join(process.env.PWD, 'uploads', fileName + '.wav');
  const videoFile = path.join(process.env.PWD, 'uploads', fileName + '.webm');
  const mergedFile = path.join(process.env.PWD, 'uploads', fileName + '-merged.webm');

  new FFmpeg({ source: videoFile })
    .addInput(audioFile)
    .on('error', (err) => socket.emit('ffmpeg-error', 'ffmpeg : An error occurred: ' + err.message))
    //.on('progress', (progress) => socket.emit('ffmpeg-output', Math.round(progress.percent)))
    .on('end', () => {
      //socket.emit('merged', fileName + '-merged.webm');
      console.log('Merging finished !');

      // removing audio/video files
      fs.unlink(audioFile);
      fs.unlink(videoFile);

      console.log('Uploading to youtube');
      uploadToYoutube(fileName + '-merged', 'party video', mergedFile);
    })
    .saveToFile(mergedFile);
}

let clientSocket = { 
  emit: () => {},
};

const client = {
  record(state) {
    shouldRecord = state;

    if (!shouldRecord)
    {
      clientSocket.emit('stop-recording');
    }
    else
    {
      clientSocket.emit('start-recording');
    }
  },
  init(io) {
    io.sockets.on('connection', (socket) => {
      clientSocket = socket;

      socket.on('message', (data) => {
        //if (!shouldRecord) {
        //  return;
        //}
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
