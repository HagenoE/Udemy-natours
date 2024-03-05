// Server
import './helpers/dotEnv.js'
import pkg from 'mongoose';
const { connect } = pkg;

import app from './app.js';

process.on('uncaughtException', (err) => {
  console.error(err);
  process.exit(1);
});

const port = process.env.PORT || 3000;

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const server = app.listen(port);

process.on('unhandledRejection', (err) => {
  server.close(() => {
    console.error(err);
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.error(err);
  });
})
