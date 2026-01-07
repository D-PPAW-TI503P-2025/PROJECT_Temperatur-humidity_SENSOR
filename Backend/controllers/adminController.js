const bcrypt = require("bcrypt");
const User = require("../models/register"); // model user

// ===============================
// GET SEMUA USER (ADMIN)
// ===============================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id_user", "nama_lengkap", "email", "role"],
      order: [["id_user", "ASC"]]
    });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data user"
    });
  }
};

// ===============================
// UPDATE USER (ADMIN)
// ===============================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_lengkap, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    if (nama_lengkap) {
      user.nama_lengkap = nama_lengkap;
    }

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User berhasil diupdate",
      data: {
        id_user: user.id_user,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Gagal update user"
    });
  }
};

// ===============================
// DELETE USER (ADMIN)
// ===============================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.destroy({
      where: { id_user: id }
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "User berhasil dihapus"
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus user"
    });
  }
};
