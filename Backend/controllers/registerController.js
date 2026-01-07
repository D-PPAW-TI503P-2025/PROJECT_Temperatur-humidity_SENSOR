const bcrypt = require("bcrypt"); // atau 'bcryptjs' jika ada masalah install
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

// Definisi model User langsung di controller (tanpa User.js)
const User = sequelize.define("User", {
  id_user: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama_lengkap: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM("admin", "warga"), allowNull: false }
}, { tableName: "users", timestamps: true });

// Controller registrasi
const register = async (req, res) => {
  try {
    const { nama_lengkap, email, password } = req.body;

    if (!nama_lengkap || !email || !password)
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });

    // Cek email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar." });

    // Tentukan role: jika email mengandung "admin" jadi admin, selain itu warga
    const role = email.toLowerCase().includes("admin") ? "admin" : "warga";

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan user baru
    const newUser = await User.create({
      nama_lengkap,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: "Registrasi berhasil!",
      user: {
        id_user: newUser.id_user,
        nama_lengkap,
        email,
        role
      }
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server.", error: error.message });
  }
};

module.exports = { register };
