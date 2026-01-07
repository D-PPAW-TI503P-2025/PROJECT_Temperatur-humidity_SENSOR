// Home.js
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Chart from "chart.js/auto";
import "./home.css";

const apiKey = "0b9df6f938d12c83c84a1bd3f78d8339";

export default function Home() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [dailyDetail, setDailyDetail] = useState(null);
  const [hourlyDetail, setHourlyDetail] = useState([]);
  const mapRef = useRef(null);
  const chartRef = useRef(null);
  const markerRef = useRef(null);
  const [mapLayers, setMapLayers] = useState({});

  // INIT MAP
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("weather-map", { zoomControl: true }).setView([-2.5, 118], 5);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const cloudsLayer = L.tileLayer(
        `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`,
        { opacity: 0.6 }
      ).addTo(map);

      mapRef.current = map;
      setMapLayers({ clouds: cloudsLayer });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // GET WEATHER
  const getWeather = async () => {
    if (!city.trim()) {
      alert("Masukkan nama kota!");
      return;
    }

    try {
      const encodedCity = encodeURIComponent(city);

      // CUACA SAAT INI
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${apiKey}&units=metric&lang=id`
      );
      if (!weatherRes.ok) {
        alert("Kota tidak ditemukan!");
        return;
      }

      const w = await weatherRes.json();
      setWeatherData(w);

      loadWeatherMap(w.coord.lat, w.coord.lon);

      // FORECAST 5 HARI
      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodedCity}&appid=${apiKey}&units=metric&lang=id`
      );
      const f = await forecastRes.json();

      const forecastArr = [];
      for (let i = 0; i < f.list.length; i += 8) {
        forecastArr.push(f.list[i]);
        if (forecastArr.length === 5) break;
      }

      setForecastData(forecastArr);
    } catch (err) {
      console.error(err);
      alert("Error mengambil data cuaca.");
    }
  };

  // MAP UPDATE
  const loadWeatherMap = (lat, lon) => {
    if (!mapRef.current) return;

    mapRef.current.setView([lat, lon], 9);

    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }

    markerRef.current = L.marker([lat, lon])
      .addTo(mapRef.current)
      .bindPopup("Lokasi yang Anda cari")
      .openPopup();

    Object.values(mapLayers).forEach((layer) => {
      if (mapRef.current.hasLayer(layer)) mapRef.current.removeLayer(layer);
    });

    const cloudsLayer = L.tileLayer(
      `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      { opacity: 0.6 }
    ).addTo(mapRef.current);

    const precipitation = L.tileLayer(
      `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`,
      { opacity: 0.5 }
    ).addTo(mapRef.current);

    setMapLayers({ clouds: cloudsLayer, precipitation });
  };

  // DETAIL PER JAM (fix untuk API gratis)
  const showDailyDetail = (hourlyData, date, isToday = false) => {
    if (!hourlyData || !Array.isArray(hourlyData)) {
      setDailyDetail(null);
      setHourlyDetail([]);
      return;
    }

    setDailyDetail(date);

    let filteredData = hourlyData;
    if (isToday) {
      const now = new Date();
      filteredData = hourlyData.filter((h) => new Date(h.dt * 1000) >= now);
    }

    setHourlyDetail(filteredData);

    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");

    const labels = filteredData.map((d) =>
      new Date(d.dt * 1000).getHours() + ":00"
    );

    const temps = filteredData.map((d) => d.main?.temp ?? 0);

    if (chartRef.current.chartInstance) chartRef.current.chartInstance.destroy();

    chartRef.current.chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Suhu (°C)",
            data: temps,
            borderColor: "#0e4a86",
            backgroundColor: "rgba(14,74,134,0.2)",
            tension: 0.3,
          },
        ],
      },
      options: { responsive: true },
    });
  };

  const getIcon = (icon) =>
    `https://openweathermap.org/img/wn/${icon}@2x.png`;

  const formatDate = (date) =>
    date.toLocaleDateString("id-ID", { day: "2-digit", month: "long" });

  // LOGOUT
  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div>
      <header>
        <div className="logo">
          <h1>CUACAAN</h1>
        </div>
      <nav>
          <a href="/home">Beranda</a>
          <a href="/datauser">Data User</a>
          <a href="/sensor">Sensor</a> {/* <-- link ke halaman ESP32 simulasi */}
          <button onClick={() => (window.location.href = "/login")}>Logout</button>
        </nav>
      </header>

      <section className="search">
        <h2>Cek kondisi cuaca di lokasi yang Anda inginkan!</h2>
        <div className="search-form">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Masukkan nama kota"
          />
          <button onClick={getWeather}>Cari Cuaca</button>
        </div>
      </section>

      <section className="weather-map-section">
        <div className="weather-display">
          <h2>Cuaca Saat Ini</h2>
          {weatherData && (
            <div className="current-weather">
              <div className="current-left">
                <img
                  src={getIcon(weatherData.weather[0].icon)}
                  alt={weatherData.weather[0].description}
                  className="weather-icon"
                />
                <div className="temp-main">
                  {Math.round(weatherData.main.temp)}°C
                </div>
                <div className="condition">
                  {weatherData.weather[0].description}
                </div>
                <div className="feels-like">
                  Terasa seperti {Math.round(weatherData.main.feels_like)}°C
                </div>
              </div>

              <div className="current-right">
                <p>
                  <strong>Kelembapan:</strong> {weatherData.main.humidity}%
                </p>
                <p>
                  <strong>Kecepatan Angin:</strong> {weatherData.wind.speed} m/s
                </p>
                <p>
                  <strong>Tekanan Udara:</strong> {weatherData.main.pressure} hPa
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="map">
          <h2>Peta Cuaca Indonesia</h2>
          <div id="weather-map" style={{ width: "100%", height: "100%" }}></div>
        </div>
      </section>

      <section className="forecast">
        <h2>Prakiraan Cuaca 5 Hari</h2>
        <div style={{ display: "flex", gap: 15, overflowX: "auto" }}>
          {forecastData.map((day, idx) => {
            const date = new Date(day.dt * 1000);

            return (
              <div
                className="forecast-card"
                key={idx}
                onClick={async () => {
                  if (!weatherData) return;

                  try {
                    // ambil data per jam dari forecast
                    const detailRes = await fetch(
                      `https://api.openweathermap.org/data/2.5/forecast?lat=${weatherData.coord.lat}&lon=${weatherData.coord.lon}&units=metric&lang=id&appid=${apiKey}`
                    );
                    const fd = await detailRes.json();

                    const target = date.toISOString().slice(0, 10);

                    const hourly = fd.list.filter((item) =>
                      item.dt_txt.startsWith(target)
                    );

                    showDailyDetail(hourly, date, idx === 0);
                  } catch (err) {
                    console.error(err);
                    alert("Gagal mengambil data detail harian.");
                  }
                }}
              >
                <div className="forecast-date">{formatDate(date)}</div>

                <img
                  src={getIcon(day.weather[0].icon)}
                  alt={day.weather[0].description}
                />

                <div className="forecast-temp">
                  {Math.round(day.main.temp)}°C
                </div>

                <div className="forecast-desc">
                  {day.weather[0].description}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {dailyDetail && (
        <section
          className="daily-detail"
          style={{ display: "block", margin: "40px auto", maxWidth: 900 }}
        >
          <h2>{formatDate(dailyDetail)}</h2>
          <canvas ref={chartRef} height={200}></canvas>

          <div
            style={{
              display: "flex",
              gap: 15,
              overflowX: "auto",
              marginTop: 15,
            }}
          >
            {hourlyDetail.map((hour, i) => {
              const hourStr = new Date(hour.dt * 1000).getHours() + ":00";
              const temp = hour.main?.temp ?? 0;

              return (
                <div key={i} style={{ textAlign: "center", minWidth: 80 }}>
                  <div>{hourStr}</div>

                  <img
                    src={getIcon(hour.weather[0].icon)}
                    alt={hour.weather[0].description}
                    width={40}
                    height={40}
                  />

                  <div>{Math.round(temp)}°C</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <footer>
        <p>&copy; 2025 CUACAAN | Data cuaca oleh OpenWeatherMap</p>
      </footer>
    </div>
  );
}
