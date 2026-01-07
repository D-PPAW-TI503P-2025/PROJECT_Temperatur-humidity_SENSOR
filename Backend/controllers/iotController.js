const { SensorLog } = require('../models');

/**
 * ===============================
 * TERIMA DATA DARI ESP32
 * POST /api/iot/data
 * ===============================
 */
exports.receiveSensorData = async (req, res) => {
  try {
    const { suhu, kelembaban, cahaya } = req.body;

    // Validasi
    if (suhu === undefined || kelembaban === undefined) {
      return res.status(400).json({
        status: "error",
        message: "Data tidak valid"
      });
    }

    // Simpan ke database
    const savedData = await SensorLog.create({
      suhu: parseFloat(suhu),
      kelembaban: parseFloat(kelembaban),
      cahaya: parseInt(cahaya) || 0
    });

    console.log(
      `💾 [SAVED] Suhu: ${suhu} | Lembab: ${kelembaban} | Cahaya: ${cahaya}`
    );

    res.status(201).json({ status: "ok", data: savedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * ===============================
 * AMBIL DATA TERAKHIR SENSOR
 * GET /api/iot
 * ===============================
 */
exports.getLastSensorData = async (req, res) => {
  try {
    const lastData = await SensorLog.findOne({
      order: [['createdAt', 'DESC']]
    });

    if (!lastData) {
      return res.json({ suhu: 0, kelembaban: 0, cahaya: 0 });
    }

    res.json(lastData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * ===============================
 * AMBIL RIWAYAT DATA SENSOR
 * GET /api/iot/history
 * ===============================
 */
exports.getSensorHistory = async (req, res) => {
  try {
    const data = await SensorLog.findAll({
      limit: 20,               // 20 data terakhir
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: "success",
      data: data.reverse()     // urutkan dari lama ke baru
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
};
