"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../services/userService" // Adjust path as needed

const SignUp = ({ onLogin }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [error, setError] = useState("")

  const { firstName, lastName, email, password, confirmPassword } = formData

  // Reset transition state when component mounts
  useEffect(() => {
    setIsTransitioning(false)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      // Send only the data needed for registration
      const userData = await registerUser({
        firstName,
        lastName,
        email,
        password
      })
      
      // Save user data in localStorage for persistence
      localStorage.setItem('userId', userData.id)
      localStorage.setItem('userEmail', userData.email)
      localStorage.setItem('userName', `${userData.firstName} ${userData.lastName}`)
      
      // Call the onLogin function
      onLogin(userData)
      
      // Navigate to dashboard
      navigate("/dashboard")
    } catch (error) {
      setError("Registration failed. Please try again.")
      console.error("Registration error:", error)
    }
  }

  const goToLogin = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      navigate("/")
    }, 700)
  }

  return (
    <div className="auth-container">
      <div className={`auth-side ${isTransitioning ? "slide-right" : ""}`}>
        <div className="auth-decoration">
          <div className="circle circle-top-left"></div>
          <div className="dots-pattern dots-pattern-top-right">
            {Array(36)
              .fill()
              .map((_, i) => (
                <div key={i} className="dot"></div>
              ))}
          </div>
          <div className="dots-pattern dots-pattern-bottom-left">
            {Array(36)
              .fill()
              .map((_, i) => (
                <div key={i} className="dot"></div>
              ))}
          </div>
          <div className="circle circle-bottom-right"></div>
        </div>
      </div>
      <div className={`auth-side ${isTransitioning ? "slide-right" : ""}`}>
        <div className="auth-side-content">
          <div className="auth-form">
            <div>
              <h1>HelloBook</h1>
              <p>Create New Account</p>
            </div>
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={firstName}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={lastName}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={handleChange}
                required
              />
              <button type="submit">Sign up</button>
            </form>
            <div className="auth-link" onClick={goToLogin}>
              Already have an account?
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp