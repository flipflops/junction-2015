/* eslint no-console: 0*/
import express from 'express';
import { auth, requestAuth, powerSocketPower, lightBulbPower, lightBulbColor } from './server/cozify_client';

const app = express();

const state = {};

app.get('/', (req, res)=> {
  res.send('Welcome to trivialbuttons.com');
  console.log(req);
});

// GET for easier debug
app.get('/api/auth', (req, res) => {
  auth(req.query.email, req.query.password)
    .then(
      () => res.send(200),
      ()=> res.send(401)
    );
});

app.get('/api/auth/request', (req, res) => {
  requestAuth(req.query.email)
    .then(
      () => res.send(200),
      ()=> res.send(401)
    );
});

app.get('/api/btn', (req, res)=> {
  res.send('touched: ' + state.touched + ' state: ' + state.on);
});

app.post('/api/btn', (req, res)=> {
  state.touched = new Date().getTime();
  state.on = !state.on;

  powerSocketPower(state.on).then(
    ()=> console.log('Switched power socket'),
    (err)=> console.error('Error switching power socket: ' + err)
  );

  lightBulbPower(state.on).then(
    () => console.log('Switched light bulb'),
    (err) => console.error('Error switching light bulb: ' + err)
  );

  lightBulbColor(Math.random(), 1.0, 1.0).then(
    () => console.log('Switched the light bulb color'),
    (err) => console.error('Error switching light bulb color: ' + err)
  );

  res.sendStatus(200);
});

const server = app.listen(process.env.PORT || 3000, ()=> {
  const host = server.address().host;
  const port = server.address().port;

  // Start with off state
  state.on = false;

  console.log('App listening at http://%s:%s', host, port);
});

export {
  app,
  server,
};
