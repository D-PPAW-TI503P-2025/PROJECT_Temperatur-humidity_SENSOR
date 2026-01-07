const { Sequelize } = require("sequelize");
require("dotenv").config();

// Buat koneksi Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    dialect: process.env.DB_DIALECT || "mysql",
    port: process.env.DB_PORT || 3306,
    logging: false,  // set true kalau mau lihat query
    timezone: "+07:00"
  }
);

// Cek koneksi
sequelize.authenticate()
  .then(() => console.log("Database connected."))
  .catch(err => console.error("Unable to connect to the database:", err));

module.exports = sequelize;
