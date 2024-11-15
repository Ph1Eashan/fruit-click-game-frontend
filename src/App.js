// src/App.js
import "./App.css";
import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import RankPage from "./pages/RankPage";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./pages/LoginPage";
import Register from "./pages/Register";
import PrivateRoute from "./context/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/rank" element={<RankPage />} />
        <Route
          path="/login"
          element={
            localStorage.getItem("token") ? (
              <Navigate to="/player-home" /> // Redirect logged-in users to their dashboard
            ) : (
              <Login />
            )
          }
        />
        {/* Register page route */}
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute roles={["admin"]} element={<AdminDashboard />} />
          }
        />
        <Route
          path="/player-home"
          element={<PrivateRoute roles={["player"]} element={<HomePage />} />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
