import request from 'superagent';
import { Promise } from 'es6-promise';
import fs from 'fs';

const AUTH_URL = 'https://cloud2.cozify.fi/cc/0.1/user/emaillogin';
const REQUEST_AUTH_URL = 'https://cloud2.cozify.fi/cc/0.1/user/requestlogin';
const COMMAND_URL = 'http://172.16.10.156:8893/cc/0.7/devices/command';
const TOKEN_FILE = '/tmp/cozifytoken';

const POWER_SOCKET_ID = '700e3cae-83d1-11e5-a7fc-544a1686317e';
const LIGHT_BULB_ID = '3a689bf6-84d3-11e5-b548-544a1686317e';

const settings = {};

fs.exists(TOKEN_FILE, (exists) => {
  if (exists) {
    fs.readFile(TOKEN_FILE, (e, data) => {
      if (e) {
        console.error(e);
      } else {
        settings.AUTH_TOKEN = data;
        console.log("Read access token");
      }
    });
  }
});

function handleResponse(resolve, reject) {
  return (err, res) => {
    if (err) {
      reject(err)
    } else {
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

export function powerSocketPower(on) {
  return new Promise((resolve, reject) => {
    request.put(COMMAND_URL)
      .set('Authorization', settings.AUTH_TOKEN)
      .send({ 
        id: POWER_SOCKET_ID,
        type: (on ? 'CMD_DEVICE_ON' : 'CMD_DEVICE_OFF')
      })
      .end(handleResponse(resolve, reject));
  });
}

export function lightBulbPower(on) {
  return new Promise((resolve, reject) => {
    request.put(COMMAND_URL)
      .set('Authorization', settings.AUTH_TOKEN)
      .send({
        id: LIGHT_BULB_ID,
        type: (on ? 'CMD_DEVICE_ON' : 'CMD_DEVICE_OFF')
      })
      .end(handleResponse(resolve, reject));
  });
}

export function lightBulbColor(hue, saturation, brightness) {
    return new Promise((resolve, reject) => {
      request.put(COMMAND_URL)
        .set('Authorization', settings.AUTH_TOKEN)
        .send({
          id: LIGHT_BULB_ID,
          type: 'CMD_DEVICE',
          state:
          {
            brightness: brightness,
            colorMode: 'hs',
            hue: hue,
            isOn: true,
            lastSeen: 1446902579825,
            maxTemperature: 6622.516556291391,
            minTemperature: 2000,
            reachable: true,
            saturation: saturation,
            temperature: -1,
            transitionMsec: null,
            type: 'STATE_LIGHT'
          }
        })
        .end(handleResponse(resolve, reject));
    });
}
