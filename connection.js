const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost', 
    user: 'root',
    password: 'ZeZ@jag9',
    database: 'employee_tracker'
  });
  
  module.exports = connection;
