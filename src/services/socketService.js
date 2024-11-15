import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Replace with actual backend URL

// Log to check if socket connects successfully
socket.on("connect", () => {
  console.log("Socket connected with ID:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Socket disconnected");
});

export default socket;
