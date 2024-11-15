import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import socket from "../services/socketService"; // Import the socket service
import { getPlayers } from "../services/playerService"; // API call to fetch rankings

function RankPage() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initial fetch to get rankings from the API
    const fetchInitialRankings = async () => {
      try {
        const playersData = await getPlayers();
        // Sort players by clickCount in descending order
        const sortedPlayers = playersData.sort(
          (a, b) => b.clickCount - a.clickCount
        );
        setPlayers(sortedPlayers);
        setError(null);
      } catch (err) {
        console.error("Error fetching initial rankings:", err);
        setError("Failed to fetch player rankings.");
      } finally {
        setLoading(false); // Initial load is complete
      }
    };

    fetchInitialRankings();

    // Listen for real-time ranking updates
    const handleUpdateRankings = (updatedPlayers) => {
      const sortedPlayers = updatedPlayers.sort(
        (a, b) => b.clickCount - a.clickCount
      );
      setPlayers(sortedPlayers);
    };

    socket.on("updateRankings", handleUpdateRankings);

    // Cleanup the listener on component unmount
    return () => {
      socket.off("updateRankings", handleUpdateRankings);
    };
  }, []);

  if (loading) {
    return <div>Loading rankings...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      {/* <Link to="/player-home">Continue Playing!</Link> */}
      <h1>Player Rankings</h1>
      {players.length > 0 ? (
        <ul>
          {players.map((player, index) => (
            <li key={player._id}>
              Rank #{index + 1}: {player.username} - Clicks: {player.clickCount}
            </li>
          ))}
        </ul>
      ) : (
        <p>No players to display yet.</p>
      )}
      {/* <button onClick={handleLogout}>Logout</button> */}
    </div>
  );
}

export default RankPage;
