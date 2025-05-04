"use client"

import { useState, useEffect } from "react"
import { getUserById, updateUserProfile, changePassword } from "../services/userService" // Adjust path as needed

const Settings = () => {
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [loading, setLoading] = useState(true)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [profileError, setProfileError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  // Fetch user profile data when component mounts
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Get the user ID from localStorage
      const userId = localStorage.getItem('userId')
      
      if (!userId) {
        setProfileError("User not logged in")
        setLoading(false)
        return
      }
      
      try {
        setLoading(true)
        const userData = await getUserById(userId)
        
        setProfileData({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || "",
          role: userData.role || "User", // Default role if not provided
        })
        
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user profile:", error)
        setProfileError("Failed to load profile data")
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData({
      ...profileData,
      [name]: value,
    })
    // Clear success/error message when user makes changes
    setProfileSuccess(false)
    setProfileError("")
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
    // Clear success/error message when user makes changes
    setPasswordSuccess(false)
    setPasswordError("")
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileSuccess(false)
    setProfileError("")
    
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setProfileError("User not logged in")
      return
    }
    
    try {
      await updateUserProfile(userId, profileData)
      
      // Update user name in localStorage
      localStorage.setItem('userEmail', profileData.email)
      localStorage.setItem('userName', `${profileData.firstName} ${profileData.lastName}`)
      
      setProfileSuccess(true)
    } catch (error) {
      console.error("Error updating profile:", error)
      setProfileError("Failed to update profile. Please try again.")
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordSuccess(false)
    setPasswordError("")
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New password and confirm password do not match!")
      return
    }
    
    const userId = localStorage.getItem('userId')
    if (!userId) {
      setPasswordError("User not logged in")
      return
    }
    
    try {
      await changePassword(
        userId, 
        passwordData.currentPassword, 
        passwordData.newPassword
      )
      
      setPasswordSuccess(true)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      setPasswordError("Failed to update password. Please check your current password and try again.")
    }
  }

  if (loading) {
    return <div>Loading profile data...</div>
  }

  return (
    <div className="settings">
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Edit Your Profile</h2>
        {profileSuccess && <div className="success-message" style={{ color: 'green', marginBottom: '10px' }}>Profile updated successfully!</div>}
        {profileError && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{profileError}</div>}
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={profileData.firstName}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={profileData.lastName}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleProfileChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <input type="text" id="role" name="role" value={profileData.role} readOnly />
          </div>
          <button type="submit" className="modal-btn modal-btn-confirm">
            Save Changes
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h2 className="settings-section-title">Change Password</h2>
        {passwordSuccess && <div className="success-message" style={{ color: 'green', marginBottom: '10px' }}>Password updated successfully!</div>}
        {passwordError && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{passwordError}</div>}
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>
          <button type="submit" className="modal-btn modal-btn-confirm">
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}

export default Settings