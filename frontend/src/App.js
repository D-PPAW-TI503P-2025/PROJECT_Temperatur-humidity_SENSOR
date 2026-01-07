// App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import DataUser from "./components/DataUser";
import SensorDashboard from "./components/SensorDashboard";

// Proteksi login
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// Proteksi admin (HARUS login + role admin)
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return role === "admin" ? children : <Navigate to="/home" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* default: selalu ke login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* login */}
        <Route path="/login" element={<Login />} />

        {/* user biasa */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sensor"
          element={
            <ProtectedRoute>
              <SensorDashboard />
            </ProtectedRoute>
          }
        />

        {/* admin */}
        <Route
          path="/datauser"
          element={
            <AdminRoute>
              <DataUser />
            </AdminRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
