const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize"); // koneksi ke database

const SensorLog = sequelize.define(
  "SensorLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    suhu: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    kelembaban: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    cahaya: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "sensorlogs", // nama tabel di DB
    timestamps: true, // otomatis buat createdAt & updatedAt
  }
);

module.exports = SensorLog;
