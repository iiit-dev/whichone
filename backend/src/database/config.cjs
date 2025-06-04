require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'Unread7-Facebook-Jump-Starlet',
    database: process.env.DB_NAME || 'which-one',
    host: process.env.DB_HOST || 'database-06-04-2025-my-sql.cp404wgy0328.ap-south-1.rds.amazonaws.com',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql'
  },
  test: {
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'Unread7-Facebook-Jump-Starlet',
    database: process.env.DB_NAME || 'which-one',
    host: process.env.DB_HOST || 'database-06-04-2025-my-sql.cp404wgy0328.ap-south-1.rds.amazonaws.com',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql'
  },
  production: {
    username: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'Unread7-Facebook-Jump-Starlet',
    database: process.env.DB_NAME || 'which-one',
    host: process.env.DB_HOST || 'database-06-04-2025-my-sql.cp404wgy0328.ap-south-1.rds.amazonaws.com',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql'
  }
}; 