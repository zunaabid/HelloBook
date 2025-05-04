"use client"

import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { useState, useEffect } from "react"
import EditContactModal from "./EditContactModal"
import DeleteContactModal from "./DeleteContactModal"
import AddContactModal from "./AddContactModal"
import { fetchContacts, searchContacts, createContact, updateContact, deleteContact } from "../services/contactService"
import { getUserById } from '../services/userService';

const Contacts = () => {

  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [selectedContacts, setSelectedContacts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [currentPage, setCurrentPage] = useState(0) 
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [editContact, setEditContact] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [contactToDelete, setContactToDelete] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Sort and filter states
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [currentSort, setCurrentSort] = useState("")
  const [selectedTitles, setSelectedTitles] = useState([])


  const contactsPerPage = 10

  // User profile data
  const [userProfile, setUserProfile] = useState({
    firstName: "",
    lastName: "",
    role: "",
    avatar: null,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Get the user ID from localStorage
        const userId = localStorage.getItem('userId');
        
        if (userId) {
          const userData = await getUserById(userId);
          setUserProfile({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            role: userData.role || "User",
            avatar: userData.avatar || null,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUserProfile();
  }, []);

  // Load contacts from API
  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoading(true)
        const data = await fetchContacts(currentPage, contactsPerPage)
        setContacts(data.content) 
        setFilteredContacts(data.content)
        setTotalPages(data.totalPages)
        setTotalItems(data.totalElements)
        setLoading(false)
      } catch (err) {
        setError("Failed to load contacts")
        setLoading(false)
        console.error(err)
      }
    }

    loadContacts()
  }, [currentPage, refreshKey])

  // Apply filtering on client side
  useEffect(() => {
    let result = [...contacts]

    // Apply sorting
    if (currentSort) {
      result.sort((a, b) => {
        if (currentSort === "firstNameAsc") {
          return a.firstName.localeCompare(b.firstName)
        } else if (currentSort === "firstNameDesc") {
          return b.firstName.localeCompare(a.firstName)
        } else if (currentSort === "lastNameAsc") {
          return a.lastName.localeCompare(b.lastName)
        } else if (currentSort === "lastNameDesc") {
          return b.lastName.localeCompare(a.lastName)
        }
        return 0
      })
    }
    

    // Apply title filtering
    if (selectedTitles.length > 0) {
      result = result.filter((contact) => selectedTitles.includes(contact.title))
    }

    setFilteredContacts(result)
  }, [contacts, currentSort, selectedTitles])

  // Handle search 
  const handleSearch = async (e) => {
    const term = e.target.value
    setSearchTerm(term)

    if (term.trim() === "") {
      setShowSearchResults(false)
      // Reset to original contacts
      const data = await fetchContacts(currentPage, contactsPerPage)
      setContacts(data.content)
      setFilteredContacts(data.content)
      return
    }

    try {
      // For immediate feedback in dropdown
      const results = contacts.filter(
        (contact) =>
          contact.firstName.toLowerCase().includes(term.toLowerCase()) ||
          contact.lastName.toLowerCase().includes(term.toLowerCase()) ||
          contact.email.toLowerCase().includes(term.toLowerCase()) ||
          contact.phone.toLowerCase().includes(term.toLowerCase()) ||
          contact.title.toLowerCase().includes(term.toLowerCase()),
      )
      setSearchResults(results)
      setShowSearchResults(true)

      // For full search using backend
      const searchData = await searchContacts(term, 0, contactsPerPage)
      setContacts(searchData.content)
      setFilteredContacts(searchData.content)
      setTotalPages(searchData.totalPages)
      setTotalItems(searchData.totalElements)
    } catch (err) {
      console.error("Search error:", err)
    }
  }

  const formatPhoneNumber = (phoneStr) => {
    if (!phoneStr) return '';
    
    try {
      const phoneInput = phoneStr.startsWith('+') ? phoneStr : '+' + phoneStr;
      const phoneNumber = parsePhoneNumberFromString(phoneInput);
      
      if (phoneNumber) {
        return phoneNumber.formatInternational();
      } else {
        return phoneStr.startsWith('+') ? phoneStr : '+' + phoneStr;
      }
    } catch (error) {
      console.log('Error formatting phone:', error);
      return phoneStr.startsWith('+') ? phoneStr : '+' + phoneStr;
    }
  };

  const handleEditClick = (contact) => {
    setEditContact({ ...contact })
    setShowEditModal(true)
  }

  const handleDeleteClick = (contact) => {
    setContactToDelete(contact)
    setShowDeleteModal(true)
  }

  const handleEditSave = async (updatedContact) => {
    try {
      await updateContact(updatedContact.id, updatedContact)
      setShowEditModal(false)
      setRefreshKey((prev) => prev + 1) 
    } catch (err) {
      console.error("Error updating contact:", err)
      
    }
  }

  const handleDeleteConfirm = async () => {
    if (!contactToDelete) return

    try {
      await deleteContact(contactToDelete.id)
      setShowDeleteModal(false)
      setContactToDelete(null)
      setRefreshKey((prev) => prev + 1) 
    } catch (err) {
      console.error("Error deleting contact:", err)
      
    }
  }

  const handleAddSave = async (newContactData) => {
    try {
      await createContact(newContactData)
      setShowAddModal(false)
      setRefreshKey((prev) => prev + 1) 
    } catch (err) {
      console.error("Error creating contact:", err)
     
    }
  }

  const handleSortSelect = (sortOption) => {
    setCurrentSort(sortOption)
    setShowSortDropdown(false)
  }

  const handleTitleFilterChange = (title) => {
    if (selectedTitles.includes(title)) {
      setSelectedTitles(selectedTitles.filter((t) => t !== title))
    } else {
      setSelectedTitles([...selectedTitles, title])
    }
  }

  const clearFilters = () => {
    setSelectedTitles([])
    setShowFilterDropdown(false)
  }

  // Get unique titles for filter
  const uniqueTitles = [...new Set(contacts.map((contact) => contact.title))]


  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  return (
    <div className="contacts-container">
      <div className="contacts-header">
        <h1 className="contacts-title">Total Contacts</h1>
        <div className="search-bar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search Contact"
            value={searchTerm}
            onChange={handleSearch}
            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
          />
          {showSearchResults && searchTerm && (
            <div className="search-results">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="search-result-item"
                  onClick={() => {
                   
                    setShowSearchResults(false)
                  }}
                >
                  {result.firstName} {result.lastName} - {result.email}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="user-profile">
          <div className="user-avatar">
            {userProfile.avatar ? (
              <img src={userProfile.avatar || "/placeholder.svg"} alt={`${userProfile.firstName} ${userProfile.lastName}`} />
            ) : (
              <span>{userProfile.firstName.charAt(0)}</span>
            )}
          </div>
          <div className="user-info">
            <div className="user-name">{userProfile.firstName} {userProfile.lastName}</div>
            <div className="user-role">{userProfile.role}</div>
          </div>
        </div>
      </div>

      <div className="contacts-toolbar">
        <div className="toolbar-left">
          <div className="dropdown-container">
            <button className="toolbar-btn" onClick={() => setShowSortDropdown(!showSortDropdown)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 5h10"></path>
                <path d="M11 9h7"></path>
                <path d="M11 13h4"></path>
                <path d="M3 17l3 3 3-3"></path>
                <path d="M6 18V4"></path>
              </svg>
              Sort
            </button>
            {showSortDropdown && (
              <div className="dropdown-menu">
                <div
                  className={`dropdown-item ${currentSort === "firstNameAsc" ? "active" : ""}`}
                  onClick={() => handleSortSelect("firstNameAsc")}
                >
                  Ascending - First Name
                </div>
                <div
                  className={`dropdown-item ${currentSort === "firstNameDesc" ? "active" : ""}`}
                  onClick={() => handleSortSelect("firstNameDesc")}
                >
                  Descending - First Name
                </div>
                <div
                  className={`dropdown-item ${currentSort === "lastNameAsc" ? "active" : ""}`}
                  onClick={() => handleSortSelect("lastNameAsc")}
                >
                  Ascending - Last Name
                </div>
                <div
                  className={`dropdown-item ${currentSort === "lastNameDesc" ? "active" : ""}`}
                  onClick={() => handleSortSelect("lastNameDesc")}
                >
                  Descending - Last Name
                </div>
              </div>
            )}
          </div>

          <div className="dropdown-container">
            <button
              className={`toolbar-btn ${selectedTitles.length > 0 ? "active-filter" : ""}`}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filters {selectedTitles.length > 0 ? `(${selectedTitles.length})` : ""}
            </button>
            {showFilterDropdown && (
              <div className="dropdown-menu filter-menu">
                <div className="filter-header">
                  <span>Filter by Title</span>
                  <button className="clear-filter" onClick={clearFilters}>
                    Clear
                  </button>
                </div>
                <div className="filter-options">
                  {uniqueTitles.map((title) => (
                    <label key={title} className="filter-option">
                      <input
                        type="checkbox"
                        checked={selectedTitles.includes(title)}
                        onChange={() => handleTitleFilterChange(title)}
                      />
                      <span>{title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="toolbar-right">
          <button className="toolbar-btn add-btn  sidebar-color" onClick={() => setShowAddModal(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Contact
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {loading && <div className="loading-indicator">Loading contacts...</div>}
      
      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Table of contacts */}
      <div className="contacts-table-container">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>Sr#</th>
              <th>First Name</th> 
              <th>Last Name</th>   
              <th>Title</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact, index) => (
                <tr key={contact.id} className={selectedContacts.includes(contact.id) ? "selected-row" : ""}>
                  <td>{index + 1}</td> 
                  <td>{contact.firstName}</td> 
                  <td>{contact.lastName}</td>   
                  <td>{contact.title}</td>
                  <td>{contact.email}</td>
                  <td>{formatPhoneNumber(contact.phone)}</td>
                  <td className="actions-cell">
                    <button onClick={() => handleEditClick(contact)} className="action-btn edit-btn">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button onClick={() => handleDeleteClick(contact)} className="action-btn delete-btn">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>No contacts found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    {/* Pagination controls */}
    <div className="pagination-controls">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="pagination-btn"
      >
        Previous
      </button>
      <span className="pagination-info">
        Page {currentPage + 1} of {totalPages || 1}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="pagination-btn"
      >
        Next
      </button>
    </div>

      {/* Modals */}
      {showAddModal && (
        <AddContactModal
          onSave={handleAddSave}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showEditModal && (
        <EditContactModal
          contact={editContact}
          onSave={handleEditSave}
          onClose={() => setShowEditModal(false)}
        />
      )}
      
      {showDeleteModal && (
        <DeleteContactModal
          contact={contactToDelete}
          onConfirm={handleDeleteConfirm}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}

export default Contacts
