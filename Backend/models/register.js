const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize"); // koneksi ke database

const User = sequelize.define("User", {
  id_user: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nama_lengkap: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM("admin", "warga"),
    allowNull: false
  }
}, {
  tableName: "users",
  timestamps: true
});

module.exports = User;
