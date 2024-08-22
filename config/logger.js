//const fs = require('fs');
//const path = require('path');
//const { createLogger, transports, format } = require('winston');
//require('winston-daily-rotate-file');
//const dirPath = path.join('__dirname', '../logs');

//if (!fs.existsSync(dirPath)) {
//  fs.mkdirSync(dirPath);
//}

//const errorLogger = createLogger({
//  level: 'error',
//  format: format.combine(
//    format.timestamp({
//      format: () => {
//        const now = new Date().toISOString();
//        return `${now}`
//      }
//    }),
//    format.errors({ stack: true }),
//    format.printf(info => `${info.timestamp} -- ${info.level}: ${info.api} -  ${info.statusCode}  -  ${JSON.stringify(info.message)}`)
//  ),
//  transports: [
//    new transports.DailyRotateFile({ filename: `${dirPath}/errorLogger-%DATE%.log`, datePattern: "YYYY-MM-DD", maxFiles: '14d', level: 'error' })
//  ]
//});

//const infoLogger = createLogger({
//  level: 'info',
//  format: format.combine(
//    format.timestamp({
//      format: () => {
//        const now = new Date().toISOString();
//        return `${now}`
//      }
//    }),
//    format.printf(info => `${info.timestamp} -- ${info.level}: ${info.api} -  ${info.statusCode}  -  ${JSON.stringify(info.message)}`)
//  ),
//  transports: [
//    new transports.DailyRotateFile({ filename: `${dirPath}/infoLogger-%DATE%.log`, datePattern: "YYYY-MM-DD", maxFiles: '14d', level: 'info' })
//  ]
//});

//const httpLogger = createLogger({
//  level: 'info',
//  format: format.combine(
//    format.timestamp({
//      format: () => {
//        const now = new Date().toISOString();
//        return `${now}`
//      }
//    }),
//    format.printf(info => `${info.timestamp} -- ${info.message}`)
//  ),
//  transports: [
//    new transports.DailyRotateFile({ filename: `${dirPath}/httpLogger-%DATE%.log`, datePattern: "YYYY-MM-DD", maxFiles: '14d', level: 'info' })
//  ]
//});


//module.exports = { errorLogger, infoLogger, httpLogger };