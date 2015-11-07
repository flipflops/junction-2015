/* eslint no-console: 0*/
import express from 'express';

const app = express();

app.get('/', (req, res)=> res.send('Hello World!'));

const server = app.listen(process.env.PORT || 3000, ()=> {
  const host = server.address().host;
  const port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});

export {
  app,
  server,
};
