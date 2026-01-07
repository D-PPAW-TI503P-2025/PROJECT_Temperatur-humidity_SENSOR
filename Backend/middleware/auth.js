const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: "Tidak ada token! Silakan login." });
    }

    try {
        // Token biasanya format "Bearer <token>", kita ambil tokennya saja
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7, token.length) : token;
        
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        req.user = decoded; // Simpan data user di request
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token tidak valid!" });
    }
};

module.exports = verifyToken;