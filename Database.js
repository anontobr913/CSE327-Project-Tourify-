// Database.js
const mysql = require('mysql2');

class Database {
  static instance;

  constructor() {
    if (Database.instance) {
      return Database.instance;
    }

    this.connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'anonto123',
      database: 'tourify'
    });

    this.connection.connect((err) => {
      if (err) {
        console.error('Database connection failed:', err.message);
      } else {
        console.log('✅ Connected to MySQL ');
      }
    });

    Database.instance = this;
  }

  static getInstance() {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  getConnection() {
    return this.connection;
  }
}

module.exports = Database;
