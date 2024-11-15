// playerServices.js
const BASE_URL = "http://localhost:5000"; // Define the backend server URL

// Fetch rankings data
export const getPlayers = async () => {
  const response = await fetch(`${BASE_URL}/api/players/rankings`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch players");
  }

  const data = await response.json();
  if (Array.isArray(data)) {
    return data;
  } else {
    throw new Error("The response data is not an array");
  }
};

// Toggle block status (block/unblock player)
export const toggleBlockPlayer = async (playerId) => {
  const response = await fetch(`/api/players/${playerId}/block`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`, // Add token for authentication
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to toggle block status");
  }

  return await response.json();
};

// Fetch data for the specific user
export const getUserData = async (userId) => {
  const response = await fetch(`${BASE_URL}/api/players/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return response.json();
};

// Create a new player
export const createPlayer = async (playerData) => {
  const response = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(playerData),
  });

  if (!response.ok) {
    throw new Error("Failed to create player");
  }

  return response.json();
};

// Update player details
export const updatePlayer = async (playerId, playerData) => {
  const response = await fetch(`${BASE_URL}/api/players/${playerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(playerData),
  });

  if (!response.ok) {
    throw new Error("Failed to update player");
  }

  return response.json();
};

// Delete a player
export const deletePlayer = async (playerId) => {
  const response = await fetch(`${BASE_URL}/api/players/${playerId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete player");
  }

  return response.json();
};
