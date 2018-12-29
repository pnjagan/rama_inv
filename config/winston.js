const path = require('path');
const winston = require('winston');
/*
{
  error: 0,
  warn: 1,
  info: 2,
  verbose: 3,
  debug: 4,
  silly: 5
}
*/
const mainLog = path.resolve(__dirname, '..', 'logs', 'app_main.log');

/* eslint key-spacing: 0 */
const options = {
  fileProd: {
    level                          : 'debug', // 'info',
    filename                       : `${mainLog}`,
    handleExceptions               : true,
    maxsize                        : 5242880, // 5MB
    maxFiles                       : 5,
    colorize                       : false,
  },
  fileNonProd: {
    level                          : 'debug', // 'info',
    filename                       : `${mainLog}`,
    handleExceptions               : true,
    maxsize                        : 5242880, // 5MB
    maxFiles                       : 5,
    colorize                       : false,
  },
  /*
  console: {
    level           : 'debug',
    handleExceptions: true,
    json            : false,
    colorize        : true,
  },
  */
};

let logger = null;

const {  format } = winston;


const {
  combine,
  timestamp,
  label,
  printf,
} = format;

const myFormat = printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`);


logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.fileProd),
    // new winston.transports.Console(options.console),
  ],
  format: combine(
    label({ label: 'dev' }),
    timestamp(),
    myFormat,
  ),
  exitOnError: false,
});

logger.stream = {
  write(message) { // , encoding
    // use the 'info' log level so the output will be picked
    // up by both transports (file and console)
    logger.info(message);
  },
};

/*

function prodFormat() {
  const replaceError = ({ label, level, message, stack }) => ({ label, level, message, stack });
  const replacer = (key, value) => value instanceof Error ? replaceError(value) : value;
  return combine(label({ label: 'ssr server log' }), format.json({ replacer }));
}

function devFormat() {
  const formatMessage = info => `${info.level} ${info.message}`;
  const formatError = info => `${info.level} ${info.message}\n\n${info.stack}\n`;
  const format = info => info instanceof Error ? formatError(info) : formatMessage(info);
  return combine(colorize(), printf(format))
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  exitOnError: false,
  transports: [new transports.Console()],
  format: isProd ? prodFormat() : devFormat(),
});

*/
module.exports = logger;
