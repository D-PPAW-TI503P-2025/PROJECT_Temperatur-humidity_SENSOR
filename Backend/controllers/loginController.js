const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/register"); // pakai model yang sama dengan register
require("dotenv").config();

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email dan password wajib diisi" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: "Password salah" });

        // Buat token JWT
        const token = jwt.sign(
            { id_user: user.id_user, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login berhasil!",
            token,
            user: {
                id_user: user.id_user,
                nama_lengkap: user.nama_lengkap,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan server", error: error.message });
    }
};

module.exports = { login };
