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
    (err)=> console.error('Error switching power socket', err)
  );

  lightBulbPower(state.on).then(
    () => console.log('Switched light bulb'),
    (err) => console.error('Error switching light bulb')
  );

  res.send(200);
});

const server = app.listen(process.env.PORT || 3000, ()=> {
  const host = server.address().host;
  const port = server.address().port;

  // Start with off state
  state.on = false;
  
  powerSocketPower(false).then(
    ()=> console.log('Switched power socket'),
    (err)=> console.error('Error switching power socket', err)
  );

  lightBulbPower(false).then(
    () => console.log('Switched light bulb'),
    (err) => console.error('Error switching light bulb')
  );

  console.log('App listening at http://%s:%s', host, port);
});

export {
  app,
  server,
};
