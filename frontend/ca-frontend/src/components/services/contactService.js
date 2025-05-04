
const API_BASE_URL = "http://localhost:8080/api/users";


const getCurrentUserId = () => {
  const userId = localStorage.getItem('userId');
  if (!userId) {
    throw new Error("User not logged in");
  }
  return userId;
};

// Fetch contacts for the current user with pagination
export const fetchContacts = async (page = 0, size = 10) => {
  try {
    const userId = getCurrentUserId();
    const response = await fetch(`${API_BASE_URL}/${userId}/contacts?page=${page}&size=${size}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

// Search contacts for the current user
export const searchContacts = async (searchTerm, page = 0, size = 10) => {
  try {
    const userId = getCurrentUserId();
    const response = await fetch(
      `${API_BASE_URL}/${userId}/contacts/search?searchTerm=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error searching contacts:", error);
    throw error;
  }
};

// Create a new contact for the current user
export const createContact = async (contactData) => {
  try {
    const userId = getCurrentUserId();
    const response = await fetch(`${API_BASE_URL}/${userId}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creating contact:", error);
    throw error;
  }
};

// Update a contact for the current user
export const updateContact = async (id, contactData) => {
  try {
    const userId = getCurrentUserId();
    const response = await fetch(`${API_BASE_URL}/${userId}/contacts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating contact with ID ${id}:`, error);
    throw error;
  }
};

// Delete a contact for the current user
export const deleteContact = async (id) => {
  try {
    const userId = getCurrentUserId();
    const response = await fetch(`${API_BASE_URL}/${userId}/contacts/${id}`, {
      method: "DELETE",
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting contact with ID ${id}:`, error);
    throw error;
  }
};

// Get a specific contact for the current user
export const getContact = async (id) => {
  try {
    const userId = getCurrentUserId();
    const response = await fetch(`${API_BASE_URL}/${userId}/contacts/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching contact with ID ${id}:`, error);
    throw error;
  }
};
