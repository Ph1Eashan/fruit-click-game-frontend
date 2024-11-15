import React, { useState, useEffect } from "react";
import { login } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import Register from "./Register";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userRole = JSON.parse(atob(token.split(".")[1])).role;
      if (userRole === "admin") {
        navigate("/admin-dashboard");
      } else if (userRole === "player") {
        navigate("/player-home");
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login({ username, password });
      const { token, user } = response;

      // Store the token in localStorage
      localStorage.setItem("token", token);

      // Redirect based on user role (Admin or Player)
      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else if (user.role === "player") {
        navigate("/player-home");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setMessage(error.message); // Show the error message
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <div className="leftSide">
        <h1>Let's Click !</h1>
      </div>
      <div className="rightSide">
        <Register />
        <div className="lining">
          <p>Or</p>
        </div>
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Login</button>
          {message && <p>{message}</p>}
          {localStorage.getItem("token") && (
            <button onClick={handleLogout}>Logout</button>
          )}
        </form>
      </div>
    </>
  );
}

export default Login;
