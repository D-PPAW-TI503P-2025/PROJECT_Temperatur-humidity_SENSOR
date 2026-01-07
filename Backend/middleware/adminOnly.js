const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // Lanjut, kamu admin!
    } else {
        res.status(403).json({ message: "Akses Ditolak! Khusus Admin." });
    }
};

module.exports = adminOnly;