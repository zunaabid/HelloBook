import { useState, useEffect } from "react"
import { getUserById } from "../services/userService" 
import { fetchContacts } from "../services/contactService" 

const Dashboard = () => {
    const [recentContacts, setRecentContacts] = useState([])
    const [userProfile, setUserProfile] = useState({
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      avatar: null,
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true)
          
          // Get the user ID from localStorage
          const userId = localStorage.getItem('userId')
          
          if (!userId) {
            setError("User not logged in")
            setLoading(false)
            return
          }
          
          // Fetch user profile
          const userData = await getUserById(userId)
          setUserProfile({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            role: userData.role || "User",
            avatar: userData.avatar || null,
          })
          
          // Fetch recent contacts (limit to 5) - Updated here
          const contactsData = await fetchContacts(0, 5)
          setRecentContacts(contactsData.content || [])
          
          setLoading(false)
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
          setError("Failed to load dashboard data")
          setLoading(false)
        }
      }
      
      fetchData()
    }, [])

    if (loading) {
      return <div>Loading dashboard...</div>
    }

    if (error) {
      return <div style={{ color: 'red' }}>{error}</div>
    }

    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <div className="user-profile">
            <div className="user-avatar">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt={userProfile.firstName} />
              ) : (
                <span>{userProfile.firstName.charAt(0)}</span>
              )}
            </div>
            <div className="user-info">
              <div className="user-name">
                {userProfile.firstName} {userProfile.lastName}
              </div>
              <div className="user-role">{userProfile.role}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="dashboard-section" style={{ marginBottom: '2rem' }}>
            <h2 className="section-title">Recently Added Contacts</h2>
            <div className="table-responsive" style={{ marginTop: '1rem' }}>
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Sr#</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Title</th>
                    <th>Email</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContacts.length > 0 ? (
                    recentContacts.map((contact, index) => (
                      <tr key={contact.id}>
                        <td>{index + 1}</td>
                        <td>{contact.firstName}</td>
                        <td>{contact.lastName}</td>
                        <td>{contact.title}</td>
                        <td>{contact.email}</td>
                        <td>{contact.phone}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center" }}>No contacts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dashboard-section">
            <h2 className="section-title">My Contact Information</h2>
            <div className="profile-info">
              <div className="info-row">
                <div className="info-label">First Name:</div>
                <div className="info-value">{userProfile.firstName}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Last Name:</div>
                <div className="info-value">{userProfile.lastName}</div>
              </div>
              <div className="info-row">
                <div className="info-label">Email:</div>
                <div className="info-value">{userProfile.email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

export default Dashboard