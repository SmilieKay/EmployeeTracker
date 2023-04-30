const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost', 
    user: 'root',
    password: process.env.DB_PASSWORD,
    database: 'employee_tracker'
  });
  
  module.exports = connection;
