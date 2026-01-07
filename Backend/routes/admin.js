const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');

// --- CRUD LENGKAP KHUSUS ADMIN ---

// 1. GET /api/admin/users -> Lihat semua user
router.get('/users', verifyToken, adminOnly, adminController.getAllUsers);

// 2. PUT /api/admin/users/:id -> Edit user (INI YANG TADI HILANG)
router.put('/users/:id', verifyToken, adminOnly, adminController.updateUser);

// 3. DELETE /api/admin/users/:id -> Hapus user (INI JUGA HARUS ADA)
router.delete('/users/:id', verifyToken, adminOnly, adminController.deleteUser);

module.exports = router;