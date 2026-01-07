import React, { useEffect, useState } from "react";
import axios from "axios";
import "./datauser.css";

const API_BASE = "http://localhost:3001";

export default function DataUser() {
  const [users, setUsers] = useState([]);
  const [editModal, setEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ===== CEK ROLE =====
  useEffect(() => {
    const r = localStorage.getItem("role");
    if (!token || r !== "admin") {
      window.location.href = "/home";
    } else {
      setRole(r);
    }
  }, [token]);

  // ===== FETCH USERS (FIX PATH) =====
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // backend kirim { success, data }
      setUsers(res.data.data);
    } catch (error) {
      console.error("Fetch users error:", error.response?.data || error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") fetchUsers();
  }, [role]);

  // ===== DELETE USER (FIX PATH) =====
  const deleteUser = async (id_user) => {
    if (!window.confirm("Hapus user ini?")) return;

    try {
      await axios.delete(`${API_BASE}/api/admin/users/${id_user}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchUsers();
    } catch (error) {
      alert("Gagal menghapus user");
      console.error(error);
    }
  };

  // ===== EDIT USER =====
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditNama(user.nama_lengkap);
    setEditPassword("");
    setEditModal(true);
  };

  // ===== UPDATE USER (FIX PATH) =====
  const updateUser = async () => {
    try {
      await axios.put(
        `${API_BASE}/api/admin/users/${selectedUser.id_user}`,
        {
          nama_lengkap: editNama,
          password: editPassword || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("User berhasil diupdate");
      setEditModal(false);
      fetchUsers();
    } catch (error) {
      alert("Gagal update user");
      console.error(error);
    }
  };

  if (role !== "admin") return null;

  return (
    <div className="page-container">
      <header>
        <div className="logo">
          <h1>CUACAAN</h1>
        </div>
        <nav>
          <a href="/home">Beranda</a>
          <a href="/datauser" className="active">Data User</a>
          <a href="/sensor">Sensor</a>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </nav>
      </header>

      <div className="content">
        <h2>Manajemen Data User</h2>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5">Memuat data...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5">Tidak ada user</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id_user}>
                    <td>{user.id_user}</td>
                    <td>{user.nama_lengkap}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td className="action-btns">
                      <button
                        className="edit-btn"
                        onClick={() => openEditModal(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteUser(user.id_user)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit User</h3>
            <label>Nama Lengkap</label>
            <input
              type="text"
              value={editNama}
              onChange={(e) => setEditNama(e.target.value)}
            />
            <label>Password Baru (opsional)</label>
            <input
              type="password"
              value={editPassword}
              placeholder="Kosongkan jika tidak diganti"
              onChange={(e) => setEditPassword(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => setEditModal(false)}>Batal</button>
              <button className="save-btn" onClick={updateUser}>Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
