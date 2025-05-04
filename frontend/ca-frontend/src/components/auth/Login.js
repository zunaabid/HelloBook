"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { loginUser } from "../services/userService" // Adjust path as needed

const Login = ({ onLogin }) => {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [error, setError] = useState("")

  // Reset transition state when component mounts
  useEffect(() => {
    setIsTransitioning(false)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    
    try {
      const userData = await loginUser(email, password)
      
      // Save user data in localStorage for persistence
      localStorage.setItem('userId', userData.id)
      localStorage.setItem('userEmail', userData.email)
      localStorage.setItem('userName', `${userData.firstName} ${userData.lastName}`)
      
      // Call the onLogin function to update app state
      onLogin(userData)
      
      // Navigate to dashboard
      navigate("/dashboard")
    } catch (error) {
      setError("Invalid email or password. Please try again.")
      console.error("Login error:", error)
    }
  }

  const goToSignUp = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      navigate("/signup")
    },700)
  }

  return (
    <div className="auth-container">
      <div className={`auth-side ${isTransitioning ? "slide-left" : ""}`}>
        <div className="auth-side-content">
          <div className="auth-form">
            <div>
              <h1>HelloBook</h1>
              <p>Enter your credentials to access your account</p>
            </div>
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#999",
                  }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <button type="submit">Sign In</button>
            </form>
            <div className="auth-link" onClick={goToSignUp}>
              Sign Up
            </div>
          </div>
        </div>
      </div>
      <div className={`auth-side ${isTransitioning ? "slide-left" : ""}`}>
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
    </div>
  )
}

export default Login