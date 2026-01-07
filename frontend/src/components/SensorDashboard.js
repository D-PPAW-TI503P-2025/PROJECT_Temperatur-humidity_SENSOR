import React, { useState, useEffect, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Title
} from "chart.js";
import "./sensorDashboard.css";

// ===== REGISTER CHART =====
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Title);

// ===== API LOKAL =====
const API_BASE = "http://172.26.22.194:3001"; // IP backend sesuai ipconfig
const HEADERS = { "Content-Type": "application/json" };

export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState({ suhu: 0, kelembaban: 0, cahaya: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllData = useCallback(async () => {
    try {
      // ===== HISTORY =====
      const historyRes = await fetch(`${API_BASE}/api/iot/history`, { headers: HEADERS });
      const historyJson = await historyRes.json();
      const historyData = Array.isArray(historyJson.data) ? historyJson.data : [];
      setHistory(historyData);

      // ===== DATA TERBARU =====
      if (historyData.length > 0) {
        const latest = historyData[historyData.length - 1]; // ambil data terakhir
        setSensorData({
          suhu: Number(latest.suhu) || 0,
          kelembaban: Number(latest.kelembaban) || 0, // SESUAI DB
          cahaya: Number(latest.cahaya) || 0,
        });
      }

      setError("");
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Gagal mengambil data sensor");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000); // refresh tiap 5 detik
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // ===== DATA UNTUK CHART =====
  const chartData = {
    labels: history.map(item => new Date(item.createdAt).toLocaleTimeString('id-ID', {
      hour:'2-digit', minute:'2-digit', second:'2-digit'
    })),
    datasets: [
      { label: "Suhu (°C)", data: history.map(item => Number(item.suhu) || 0), tension: 0.3, yAxisID: 'y' },
      { label: "Kelembapan (%)", data: history.map(item => Number(item.kelembaban) || 0), tension: 0.3, yAxisID: 'y' },
      { label: "Cahaya (LDR)", data: history.map(item => Number(item.cahaya) || 0), tension: 0.3, yAxisID: 'y1' }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monitoring Suhu, Kelembapan & Cahaya' }
    },
    scales: {
      y: { position: 'left', title: { display: true, text: 'Suhu / Kelembapan' } },
      y1: { position: 'right', title: { display: true, text: 'Cahaya (LDR)' }, grid: { drawOnChartArea: false } }
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="sensor-dashboard">
      {/* ===== HEADER ===== */}
      <header className="navbar">
        <div className="logo"><h1>CUACAAN</h1></div>
        <nav>
          <a href="/home">Beranda</a>
          <a href="/datauser">Data User</a>
          <a href="/sensor">Sensor</a>
          <button onClick={logout}>Logout</button>
        </nav>
      </header>

      {/* ===== CONTENT ===== */}
      <div className="page-container">
        {error && <p className="error">{error}</p>}

        <div className="card-grid">
          <div className="card">
            <h3>Suhu Terakhir</h3>
            <p>{sensorData.suhu.toFixed(1)} °C</p>
          </div>
          <div className="card">
            <h3>Kelembapan Terakhir</h3>
            <p>{sensorData.kelembaban.toFixed(1)} %</p>
          </div>
          <div className="card">
            <h3>Cahaya Terakhir</h3>
            <p>{sensorData.cahaya}</p>
          </div>
        </div>

        <div className="chart-container">
          {loading
            ? <p className="loading">Memuat data...</p>
            : <Line data={chartData} options={chartOptions} />}
        </div>
      </div>
    </div>
  );
}
