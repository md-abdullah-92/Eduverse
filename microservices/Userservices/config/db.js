require("dotenv").config(); // Ensure dotenv is loaded

const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.MYSQL_DB, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST,
  dialect: "mysql",
  logging: false, // Set to `console.log` for debugging
  pool: {
    max: 10, // Maximum number of connections in the pool
    min: 0,  // Minimum number of connections
    acquire: 30000, // Maximum time (ms) to acquire a connection before throwing error
    idle: 10000, // Maximum time (ms) a connection can be idle before being released
  },
  retry: {
    max: 3, // Number of times Sequelize will retry a failed connection
  },
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL Connected...");
  } catch (error) {
    console.error("❌ MySQL Connection Error:", error.message);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

module.exports = { sequelize, connectDB };
