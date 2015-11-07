/* eslint no-console: 0*/
import express from 'express';

const app = express();

const state = {};

app.get('/', (req, res)=> res.send('Hello World!'));

app.get('/api/btn', (req, res)=> res.send('touched: ' + state.touched));

app.post('/api/btn', (req, res)=> {
  state.touched = new Date().getTime();
  console.log(req);
  res.send(200);
});

const server = app.listen(process.env.PORT || 3000, ()=> {
  const host = server.address().host;
  const port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

export {
  app,
  server,
};
