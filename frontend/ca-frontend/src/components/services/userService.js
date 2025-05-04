
const API_BASE_URL = "http://localhost:8080/api/auth"; 

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
// Change password
export const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        currentPassword: currentPassword, 
        newPassword: newPassword 
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! Status: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};
