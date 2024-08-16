const express = require("express");
const morganMiddleware = require('../middlewares/morgan.middleware');
const { routesMap } = require('../routes');


function createServer() {
    const app = express();
    const cors = require('cors');

    app.use(cors({origin: true, credentials: true}));
    app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 
    app.use(morganMiddleware);

    Object.keys(routesMap).forEach((key) => app.use(key, routesMap[key]))

    return app;
}

module.exports = { createServer }