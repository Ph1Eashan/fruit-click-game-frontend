import React, { useEffect, useState } from "react";
import {
  getPlayers,
  toggleBlockPlayer,
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "../services/playerService";
import { useNavigate } from "react-router-dom";
import socket from "../services/socketService"; // Import socket
import { logout } from "../services/authService";

function AdminDashboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    clickCount: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial players data
    const fetchPlayers = async () => {
      try {
        const playersData = await getPlayers();
        setPlayers(playersData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch players", err);
        setError("Failed to fetch players");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();

    // Listen for real-time ranking updates
    const handleUpdateRankings = (updatedPlayers) => {
      const sortedPlayers = updatedPlayers.sort(
        (a, b) => b.clickCount - a.clickCount
      );
      setPlayers(sortedPlayers);
    };

    socket.on("updateRankings", handleUpdateRankings);

    // Listen for player updates
    socket.on("updatePlayer", (updatedPlayer) => {
      console.log("Received player update:", updatedPlayer);

      // Update the player list with the updated player data
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player._id === updatedPlayer._id ? updatedPlayer : player
        )
      );
    });

    const handleNewPlayer = (newPlayer) => {
      setPlayers((prev) => [...prev, newPlayer]);
    };

    socket.on("playerCreated", handleNewPlayer);

    // Handle player deletion in real-time
    const handlePlayerDeletion = (playerId) => {
      setPlayers((prevPlayers) =>
        prevPlayers.filter((player) => player._id !== playerId)
      );
    };

    socket.on("playerDeleted", handlePlayerDeletion);

    // Listen for status update from the server
    socket.on("updatePlayerStatus", (updatedUser) => {
      console.log("Received updated user:", updatedUser);

      // Update the UI (e.g., update the player list with the new status)
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) =>
          player._id === updatedUser._id
            ? { ...player, status: updatedUser.status }
            : player
        )
      );
    });
    // Cleanup listeners on component unmount
    return () => {
      socket.off("updateRankings", handleUpdateRankings);
      socket.off("updatePlayer");
      socket.off("playerCreated", handleNewPlayer);
      socket.off("playerDeleted", handlePlayerDeletion);
      socket.off("updatePlayerStatus");
    };
  }, []);

  const handleBlockToggle = async (playerId) => {
    try {
      await toggleBlockPlayer(playerId);
    } catch (err) {
      setError(`Failed to toggle block status: ${err.message}`);
    }
  };

  const handleDelete = async (playerId) => {
    try {
      // Call the backend to delete the player
      await deletePlayer(playerId);

      // Emit the deletion event to notify other clients
      socket.emit("playerDeleted", playerId);
    } catch {
      setError("Failed to delete player");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSubmit = { ...formData };

      if (!formData.password && editingPlayer) {
        delete dataToSubmit.password;
      }

      if (editingPlayer) {
        await updatePlayer(editingPlayer._id, dataToSubmit);
        setEditingPlayer(null);
      } else {
        await createPlayer(dataToSubmit);
        socket.emit("playerCreated", dataToSubmit); // Emit new player creation event
      }

      setFormData({ username: "", password: "", clickCount: 0 });
    } catch {
      setError("Failed to save player");
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      username: player.username,
      password: "",
      clickCount: player.clickCount,
    });
  };

  const handleLogout = async () => {
    try {
      await logout(); // Call the API to log out
      localStorage.removeItem("token"); // Remove the token after successful logout
      navigate("/login"); // Redirect to login
    } catch (error) {
      console.error("Logout failed:", error);
      setError(error.message); // Optionally display an error message
    }
  };

  const handleCancel = () => {
    setEditingPlayer(null);
    setFormData({ username: "", password: "", clickCount: 0 }); // Clear the form data
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <div className="adminContainer">
        <h1>Admin Dashboard</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required={!editingPlayer}
          />
          <input
            type="number"
            placeholder="Click Count"
            value={formData.clickCount}
            onChange={(e) =>
              setFormData({ ...formData, clickCount: +e.target.value })
            }
          />
          <button type="submit">{editingPlayer ? "Update" : "Create"}</button>
          {editingPlayer && <button onClick={handleCancel}>Cancel</button>}
        </form>
      </div>
      <div className="playersPanel">
        <button className="logoutButton" onClick={handleLogout}>
          Logout
        </button>
        <ul>
          {players.map((player) => (
            <li key={player._id}>
              {player.username} - Clicks: {player.clickCount} - {player.status}
              <div className="crudButtons">
                <button onClick={() => handleBlockToggle(player._id)}>
                  {player.status === "blocked" ? "Unblock" : "Block"}
                </button>
                <button onClick={() => handleEdit(player)}>Edit</button>
                <button onClick={() => handleDelete(player._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default AdminDashboard;
