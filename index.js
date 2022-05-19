const { schedule } = require("node-cron");
const { saveForAll, processPayment } = require("./services/group.service");
const { isLastDayOfMonth } = require("./utils/date");

const app = require('./app');
require('./config/database');
const PORT = process.env.PORT || 3000;

let server;

server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

// Cron Job to automatically help members save every week on saturday
schedule('0 0 * * SAT', async () => {
  try {
    const result = await saveForAll();
    if (result) {
      console.log("cron job is complete for now!");
    }
  } catch (err) {
    throw new Error(err.message);
  }
});

// Cron Job to automatically payout members that are due for payment at the end of every month
schedule('0 00 16 28-31 * *', async () => {
  if(isLastDayOfMonth()) {
    try {
      const result = await processPayment();
      if (result) {
        console.log("cron job is complete for now!");
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }
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