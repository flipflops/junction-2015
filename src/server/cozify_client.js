import request from 'superagent';
import { Promise } from 'es6-promise';
import fs from 'fs';

const AUTH_URL = 'https://cloud2.cozify.fi/cc/0.1/user/emaillogin';
const REQUEST_AUTH_URL = 'https://cloud2.cozify.fi/cc/0.1/user/requestlogin';
const TOKEN_FILE = '/tmp/token';

const settings = {};

fs.readFile(TOKEN_FILE, (e, data) => {
  if (e) {
    console.error(e);
  } else {
    settings.AUTH_TOKEN = data;
    console.log("Read access token");
  }
});

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
