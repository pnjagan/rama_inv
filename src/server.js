const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
// const fs = require('fs');
const config = require('config'); // we load the db location from the JSON files
// const { log, errLog } = require('./common/utils');

const itemRouter = require('./routes/item');
const userRouter = require('./routes/user');
const customerRouter = require('./routes/customer');
const addressRouter = require('./routes/address');

const winston = require('../config/winston');

const log = winston.debug;
const errLog = winston.error;

const app = express();

const testlogging = false;
/*
TB : linting , assertions and logging
*/

// http serverOptions
const port = 3000;

const options = {
  //  server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
  //  replset: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } },
  useNewUrlParser: true,
};


/* ********SETUP the logger and config********** */

// //don't show the log when it is test
// if(config.util.getEnv('NODE_ENV') !== 'test') {
//     //use morgan to log at command line
//     app.use(morgan('combined')); //'combined' outputs the Apache style LOGs
// }


// Logger: production as well as dev.
//  You can set morgan to log differently depending on your environment
//  all morgan logs to file only
//  if(app.get("env")=="production") {

// const accessLogStream = fs.createWriteStream(`${__dirname}/../logs/access.log`, { flags: 'a' });
// app.use(morgan('combined', { stream: accessLogStream }));

app.use(morgan('combined', { stream: winston.stream }));


//  }else {
//        app.use(morgan("dev")); //log to console on development
//  }

/* ********SETUP the logger and config ********** */


// db connection
log(`DB :${config.DBHost}`);

mongoose.connect(config.DBHost, options);
const db = mongoose.connection;

db.on('error', errLog.bind(console, 'connection error:'));


/* ************ out of shelf MIDDLEWARE ****************************** */

const publicPath = path.resolve(__dirname, 'public');

app.use(express.static(publicPath));

// parse application/json and look for raw text
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json' }));
/* ************ out of shelf MIDDLEWARE ****************************** */

/* ************** Error Handler *************** */
/*
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
*/
/* ************** Error Handler *************** */

app.get('/',
  (req, res) => {
    if (testlogging) {
      const a = null;
      // if (!a) {
      //   throw Error('Would be caught');
      // }


      const myFunc = (args) => {
        if (!args) {
          throw Error('this should  be uncaught');
        }
      };

      if (!a) {
        setTimeout(myFunc, 1500, a);
      }
    }
    res.json({ message: 'Welcome to Rama Invoice App (RIA)!' });
  });


/* ************start ROUTERS ***************** */
log('Test logging 123');
winston.debug('Test debug direct');
errLog('logging an error');


app.use('/item', itemRouter);
app.use('/user', userRouter);
app.use('/customer', customerRouter);
app.use('/address', addressRouter);


/* ************end ROUTERS ***************** */

// eslint-disable-next-line no-unused-vars
const server = app.listen(port);
log(`Listening on port ${port}`);

// function stop() {
//   server.close();
//   // process.exit();
// }

app.use((err, req, res, next) => {
  winston.error(err.stack);
  res.status(500).send('Something broke - let the support folks know!');
  next();
});

module.exports = { app }; // For testing
