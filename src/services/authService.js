// src/services/authService.js
const BASE_URL = "http://localhost:5000";

export const login = async (credentials) => {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  const data = await response.json();
  return data; // Ensure that you are returning the full response object
};

export const register = async (credentials) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Ensure the content type is set to JSON
    },
    body: JSON.stringify(credentials), // Send the username and password as a JSON object
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  const data = await response.json();
  return data; // This returns the message or any data sent from the backend
};

export const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No active session found");
    }

    // Send logout request to backend
    const response = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include token for authentication
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Logout failed");
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || "Logout request failed");
  }
};
