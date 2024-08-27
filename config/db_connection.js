const path = require('path');
const mysql = require("mysql2");
const CONFIG = require('../utils/config');

require('dotenv').config({ path: path.resolve('../.env') });

const dbCon = mysql.createConnection({
  connectionLimit: 10,
  host: CONFIG.DB_HOST,
  user: CONFIG.DB_USER,
  password: CONFIG.DB_PASSWORD,
  database: CONFIG.DB_DATABASE,
  port: CONFIG.DB_PORT,
  multipleStatements: true,
  keepAliveInitialDelay: 10000,
  enableKeepAlive: true
});

dbCon.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.info('Connected to MySQL');
});

module.exports = {con: dbCon}