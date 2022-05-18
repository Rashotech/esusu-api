const app = require('./app');
require('./config/database');
const PORT = process.env.PORT || 3000;

let server;

server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
    console.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
    console.log('SIGTERM received');
  if (server) {
    server.close();
  }
});