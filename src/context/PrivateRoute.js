// src/context/PrivateRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ roles, element }) {
  const token = localStorage.getItem("token"); // Check if the user is authenticated
  const userRole = token ? JSON.parse(atob(token.split(".")[1])).role : null; // Decode the token to get the role

  // If no token, redirect to login page
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If token exists but role doesn't match, redirect to login
  if (roles && !roles.includes(userRole)) {
    return <Navigate to="/login" />;
  }

  return element; // If authenticated and role matches, render the component
}

export default PrivateRoute;
