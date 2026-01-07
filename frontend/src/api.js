import axios from "axios";

// ===== BASE URL =====
const API_URL = "http://localhost:3000/api"; // sesuaikan dengan servermu

// ===== REGISTER =====
export const registerUser = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// ===== LOGIN =====
export const loginUser = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/login`, data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// ===== GET ALL USERS (ADMIN) =====
export const getAllUsers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// ===== UPDATE USER (ADMIN) =====
export const updateUser = async (id, data, token) => {
  try {
    const response = await axios.put(`${API_URL}/admin/users/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

// ===== DELETE USER (ADMIN) =====
export const deleteUser = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};
