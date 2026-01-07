require("dotenv").config();
const express = require("express");
const cors = require("cors");
const os = require("os");

// ===== Database =====
const sequelize = require("./config/sequelize");
const { SensorLog } = require("./models"); // pastikan model SensorLog diimport

// ===== Routes =====
const registerRoutes = require("./routes/register");
const loginRoutes = require("./routes/login");
const adminRoutes = require("./routes/admin");
const iotRoutes = require("./routes/iot"); // router IoT

// ===== Express App =====
const app = express();
const PORT = process.env.PORT || 3001;

// ===== Middleware =====
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "x-api-key",
    "ngrok-skip-browser-warning"
  ]
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Disable cache
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// ===== Health Check =====
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Server API aktif 🚀"
  });
});

// ===== Mount Routes =====
app.use("/api/register", registerRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/iot", iotRoutes); // PENTING

// ===== 404 Handler =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan"
  });
});

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err.stack);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan server",
    error: err.message
  });
});

// ===== Helper: ambil IP lokal =====
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
}

// ===== Start Server =====
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database terhubung");

    // Sinkronisasi model dengan database (tidak mengubah tabel yang ada)
    await sequelize.sync({ alter: false });
    console.log("✅ Database tersinkron");

    // ===== RESET SENSORLOG jika env true =====
    if (process.env.RESET_SENSORLOG === "true") {
      await SensorLog.destroy({ where: {}, truncate: true });
      console.log("🗑️ Tabel SensorLog dikosongkan (RESET_SENSORLOG=true)");
    }

    const localIP = getLocalIP();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server berjalan di:`);
      console.log(`   🔹 http://localhost:${PORT}`);
      console.log(`   🔹 http://${localIP}:${PORT}  <-- untuk akses ESP32 & perangkat lain`);
    });

  } catch (err) {
    console.error("❌ Database error:", err);
    process.exit(1); // hentikan server jika DB gagal
  }
})();
