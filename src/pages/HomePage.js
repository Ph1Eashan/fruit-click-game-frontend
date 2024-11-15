import React, { useEffect, useState } from "react";
import socket from "../services/socketService";
import { getUserData } from "../services/playerService";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { logout } from "../services/authService";
import RankPage from "./RankPage";

function HomePage() {
  const [clickCount, setClickCount] = useState(0);
  const [userStatus, setUserStatus] = useState("active");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);

      // Set currentUserId only if it's not already set
      if (!currentUserId && decodedToken.id) {
        setCurrentUserId(decodedToken.id);

        // Fetch user data on initial load
        getUserData(decodedToken.id)
          .then((userData) => {
            setClickCount(userData.clickCount);
            setUserStatus(userData.status);
          })
          .catch((error) => console.error("Error fetching user data:", error));
      }
    }

    const handleUpdateClickCount = (data) => {
      if (data.userId === currentUserId) {
        setClickCount(data.newClickCount);
        setUserStatus(data.status);
      }
    };

    const handleUpdateRankings = (players) => {
      setRankings(players); // Update rankings in real-time
    };

    const handlePlayerStatusUpdate = (updatedPlayer) => {
      if (updatedPlayer._id === currentUserId) {
        setUserStatus(updatedPlayer.status); // Update status when the admin blocks/unblocks the player
      }
    };

    socket.on("updateClickCount", handleUpdateClickCount);
    socket.on("updateRankings", handleUpdateRankings); // Listen for rank updates
    socket.on("updatePlayerStatus", handlePlayerStatusUpdate);

    // Cleanup function to remove socket listeners when the component is unmounted
    return () => {
      socket.off("updateClickCount", handleUpdateClickCount);
      socket.off("updateRankings", handleUpdateRankings); // Clean up the listener
      socket.off("updatePlayerStatus", handlePlayerStatusUpdate);
    };
  }, [currentUserId]); // Empty dependency array to run the effect only once on mount

  const handleClickBanana = () => {
    if (currentUserId) {
      socket.emit("clickBanana", currentUserId);
    }
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

  return (
    <>
      <div className="homePageContainer">
        {/* <Link to="/rank">Ranking</Link> */}
        <h1>How much can you click ?</h1>
        <button className="clickCountButton">
          <img
            src="https://t4.ftcdn.net/jpg/07/95/76/17/360_F_795761761_6WXQ3fTfAjBi4XsnHGs8XDKdMpPfwc8f.jpg"
            alt="banana"
            onClick={handleClickBanana}
          />
        </button>
        <p className="clickCountP">Your Click Count: {clickCount}</p>
        <p>Your Status: {userStatus}</p>
        <p>
          {userStatus == "inactive"
            ? "Kindly ReLogin"
            : userStatus == "blocked"
            ? "Bie bie"
            : ""}
        </p>
        <button className="logoutButton" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <div className="rankContainer">
        <RankPage />
      </div>
    </>
  );
}

export default HomePage;
