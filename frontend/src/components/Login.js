import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // <- import useNavigate
import "./Login.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ nama_lengkap: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // <- hook navigate

const backendUrl = "http://localhost:3001/api";


  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setMessage("Email dan password wajib diisi!");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);
        localStorage.setItem("nama_lengkap", data.user.nama_lengkap);
        setMessage("");

        // ===== Redirect ke Home.js =====
        navigate("/home"); // <- path sesuai Route
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan server.");
    }
  };

  const handleRegister = async () => {
    if (!registerData.nama_lengkap || !registerData.email || !registerData.password) {
      setMessage("Semua field harus diisi!");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData)
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Registrasi berhasil! Silakan login.");
        setIsLogin(true);
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      console.error(err);
      setMessage("Terjadi kesalahan server.");
    }
  };

  return (
    <div className="wrapper">
      <div className="weather-bg">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`cloud cloud${i + 1}`}></div>
        ))}
      </div>

      <div className="container">
        <h2>{isLogin ? "Login" : "Register"}</h2>
        {message && <p style={{ color: "red" }}>{message}</p>}

        {isLogin ? (
          <div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            <button onClick={handleLogin}>Login</button>
            <div className="switch">
              Belum punya akun? <span onClick={() => setIsLogin(false)}>Register</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="form-group">
              <label>Nama Lengkap</label>
              <input
                type="text"
                value={registerData.nama_lengkap}
                onChange={(e) => setRegisterData({ ...registerData, nama_lengkap: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
              />
            </div>
            <button onClick={handleRegister}>Register</button>
            <div className="switch">
              Sudah punya akun? <span onClick={() => setIsLogin(true)}>Login</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
