import request from 'superagent';
import { Promise } from 'es6-promise';
import fs from 'fs';

const AUTH_URL = 'https://cloud2.cozify.fi/cc/0.1/user/emaillogin';
const REQUEST_AUTH_URL = 'https://cloud2.cozify.fi/cc/0.1/user/requestlogin';
const COMMAND_URL = 'http://localhost:8893/cc/0.7/devices/command';
const TOKEN_FILE = '/tmp/cozifytoken';

const POWER_SOCKET_ID = '700e3cae-83d1-11e5-a7fc-544a1686317e';
const LIGHT_BULB_ID = '3a689bf6-84d3-11e5-b548-544a1686317e';

const settings = {
  AUTH_TOKEN: '',
};

fs.exists(TOKEN_FILE, (exists) => {
  if (exists) {
    fs.readFile(TOKEN_FILE, (e, data) => {
      if (e) {
        console.error(e);
      } else {
        settings.AUTH_TOKEN = data.toString();
        console.log("Read access token: " + settings.AUTH_TOKEN);
      }
    });
  }
});

function handleResponse(resolve, reject) {
  return (err, res) => {
    if (err)
    {
      reject(err)
    }
    else
    {
      resolve(res);
    }
  }
}

export function auth(email, password) {
  return new Promise((resolve, reject) => {
    request.post(AUTH_URL)
      .send({ email, password })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          settings.AUTH_TOKEN = res.text;
          fs.writeFile(TOKEN_FILE, res.text, (e) => {
            if (e) {
              console.error(e);
            } else {
              console.log("Wrote access token");
            }
          });
          resolve();
        }
      });
  });
}

export function requestAuth(email) {
  return new Promise((resolve, reject) => {
    request.post(REQUEST_AUTH_URL)
      .query({ email })
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
  });
}

function issueCommand(data) {
  return new Promise((resolve, reject) => {
    request.put(COMMAND_URL)
      .set('Authorization', settings.AUTH_TOKEN)
      .set('Content-Type', 'application/json; charset=UTF-8')
      .send(data)
      .end(handleResponse(resolve, reject));
  });
}

function powerCommand(id, on) {
  return issueCommand([ { id, type: (on ? 'CMD_DEVICE_ON' : 'CMD_DEVICE_OFF') } ]);
}

export function powerSocketPower(on) {
  return powerCommand(POWER_SOCKET_ID, on);
}

export function lightBulbPower(on) {
  return powerCommand(LIGHT_BULB_ID, on);
}

function lerp(v0, v1, t) {
  return (1-t)*v0 + t*v1;
}

export function lightBulbPartyMode() {
  var totalTime = 5000;
  var timeStep = 300;
  var stepIdx = 0;

  var interval = setInterval(function () {
    if (stepIdx * timeStep > totalTime)
    {
      clearInterval(interval);
    }

    lightBulbColor(lerp(0.0, 1.0, (stepIdx * timeStep) / totalTime).then(
      ()=> stepIdx++,
      (err)=> stepIdx++ 
    );
  }, timeStep)
}

export function lightBulbColor(hue, saturation, brightness) {
  return issueCommand([{
            id: LIGHT_BULB_ID,
            type: 'CMD_DEVICE',
            state:
            {
              brightness: brightness,
              colorMode: 'hs',
              hue: hue,
              isOn: true,
              lastSeen: (new Date()).getTime(),
              maxTemperature: 6622.516556291391,
              minTemperature: 2000,
              reachable: true,
              saturation: saturation,
              temperature: -1,
              transitionMsec: null,
              type: 'STATE_LIGHT'
            }
          }]);
}
