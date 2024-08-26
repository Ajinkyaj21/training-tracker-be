const { errorLogger, infoLogger } = require('../config/logger');

function sendSuccessRes(res, object, statusCode = 200, funcPath = '') {
    const logObject = {
        api: res.req.originalUrl,
        funcPath: funcPath,
        message: object.result,
        statusCode: statusCode
    }
    //infoLogger.info(logObject);
    return res.status(statusCode).send({success: true, failure: false, result: object.result, message: object.message || 'Success'});
}

function sendFailRes(res, object, statusCode = 500, funcPath = '') {
    const logObject = {
        api: res.req.originalUrl,
        funcPath: funcPath,
        message: object.message,
        statusCode: statusCode
    }
    //errorLogger.error(logObject);
    return res.status(statusCode).send({success: false, failure: true, message: object.message, logObject: logObject});
}

module.exports = {
    sendSuccessRes,
    sendFailRes
}