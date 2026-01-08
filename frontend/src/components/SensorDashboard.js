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
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
  Title
);

// ===== API =====
const API_BASE = "http://172.26.22.194:3001";
const HEADERS = { "Content-Type": "application/json" };

export default function SensorDashboard() {
  const [sensorData, setSensorData] = useState({
    suhu: 0,
    kelembaban: 0
  });

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAllData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/iot/history`, { headers: HEADERS });
      const json = await res.json();
      const data = Array.isArray(json.data) ? json.data : [];

      setHistory(data);

      if (data.length > 0) {
        const latest = data[data.length - 1];
        setSensorData({
          suhu: Number(latest.suhu) || 0,
          kelembaban: Number(latest.kelembaban) || 0
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
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // ===== DATA CHART =====
  const chartData = {
    labels: history.map(item =>
      new Date(item.createdAt).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    ),
    datasets: [
      {
        label: "Suhu (°C)",
        data: history.map(item => Number(item.suhu) || 0),
        tension: 0.3
      },
      {
        label: "Kelembapan (%)",
        data: history.map(item => Number(item.kelembaban) || 0),
        tension: 0.3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Monitoring Suhu & Kelembapan"
      }
    },
    scales: {
      y: {
        title: { display: true, text: "Nilai Sensor" }
      }
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
