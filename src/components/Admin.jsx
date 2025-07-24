import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Admin.css';
import '../components/styles/SuperAdminDashboard.css';
import { io } from 'socket.io-client';

const BASE_URL = 'https://backend-m6u3.onrender.com';
const socket = io(BASE_URL);

const Admin = () => {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState({ 
    username: '', 
    password: '', 
    role: '' 
  });
  const [registerData, setRegisterData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: '', 
    department: '' 
  });
  const [resetEmail, setResetEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Data states
  const [stats, setStats] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [stories, setStories] = useState([]);
  const [news, setNews] = useState([]);
  
  // Modal states
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user'));

  // Check authentication status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (!token) return;
      
      try {
        setIsLoading(true);
        const res = await fetch(`${BASE_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          localStorage.clear();
        }
      } catch (err) {
        console.error('Auth verification error:', err);
        localStorage.clear();
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyAuth();
  }, []);

  // Fetch dashboard data when authenticated
  useEffect(() => {
    if (!isLoggedIn || !token) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, incRes, disRes, stoRes, nwsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/admin/stats`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          fetch(`${BASE_URL}/api/admin/report`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          fetch(`${BASE_URL}/api/discussions`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          fetch(`${BASE_URL}/api/admin/stories`, { 
           headers: { Authorization: `Bearer ${token}` } 
         }),

          fetch(`${BASE_URL}/api/admin/news`, { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ]);

        if (!statsRes.ok || !incRes.ok || !disRes.ok || !stoRes.ok || !nwsRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [statsData, incData, disData, stoData, nwsData] = await Promise.all([
          statsRes.json(),
          incRes.json(),
          disRes.json(),
          stoRes.json(),
          nwsRes.json()
        ]);

       // setStats(statsData);
        //setIncidents(incData);
        //setDiscussions(disData);
        //setStories(stoData);
        //setNews(nwsData);setStats(statsData);
        
       // setIncidents(Array.isArray(incData) ? incData : []);
        //setDiscussions(Array.isArray(disData) ? disData : []);
        //setStories(Array.isArray(stoData) ? stoData : []);
        //setNews(Array.isArray(nwsData) ? nwsData : []);

        setIncidents(Array.isArray(incData?.data) ? incData.data : incData);
        setDiscussions(Array.isArray(disData?.data) ? disData.data : disData);
       // setStories(Array.isArray(stoData?.data) ? stoData.data : stoData);
        setStories(
        Array.isArray(stoData?.data) ? stoData.data : 
        Array.isArray(stoData) ? stoData : []
        );

        setNews(Array.isArray(nwsData?.data) ? nwsData.data : nwsData);




        
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        alert('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isLoggedIn, token]);

  // Socket.io event listeners
  useEffect(() => {
    if (!socket || !isLoggedIn) return;
    
    const handleNewIncident = (incident) => {
      setIncidents(prev => [incident, ...prev]);
      alert(`🚨 New Incident: ${incident.title}`);
    };
    
    const handleIncidentUpdated = (updated) => {
      setIncidents(prev => prev.map(i => i._id === updated._id ? updated : i));
    };
    
    socket.on("new_incident_reported", handleNewIncident);
    socket.on("incident_updated", handleIncidentUpdated);
    
    return () => {
      socket.off("new_incident_reported", handleNewIncident);
      socket.off("incident_updated", handleIncidentUpdated);
    };
  }, [isLoggedIn]);

  // Form handlers
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  // Authentication handlers
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.msg || 'Login failed');
      }
      
      if (!data.admin?.approved) {
        throw new Error('Account not yet approved by admin');
      }
      
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.admin));
      setIsLoggedIn(true);
      alert(`✅ Welcome ${data.admin.username}`);
      setLoginData({ username: '', password: '', role: '' });
    } catch (err) {
      console.error('Login error:', err);
      alert(err.message || '❌ Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.msg || 'Registration failed');
      }
      
      alert('✅ Registered successfully. Please wait for admin approval');
      setShowRegister(false);
      setRegisterData({ 
        username: '', 
        email: '', 
        password: '', 
        role: '', 
        department: '' 
      });
    } catch (err) {
      console.error('Registration error:', err);
      alert(err.message || '❌ Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) return;
    setIsLoading(true);
    
    try {
      // In a real app, you would call your password reset endpoint here
      // This is just a simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`📧 Password reset link sent to ${resetEmail}`);
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (err) {
      console.error('Password reset error:', err);
      alert('❌ Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  // Data management handlers
  const handleStatusChange = async (id, newStatus) => {
    if (!token) return;
    
    try {
      const res = await fetch(`${BASE_URL}/api/admin/report/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.msg || 'Status update failed');
      }
      
      setIncidents(prev => prev.map(i => i._id === id ? { ...i, status: newStatus } : i));
      alert(`✅ Status updated to ${newStatus}`);
    } catch (err) {
      console.error('Status update error:', err);
      alert(err.message || '❌ Error updating status');
    }
  };

  const handleDeleteItem = async (type, id) => {
    if (!token || !window.confirm(`❗ Are you sure you want to delete this ${type}?`)) return;
    
    try {
      const endpointMap = {
        incident: 'report',
        discussion: 'discussions',
        story: 'stories',
        news: 'news'
      };
      
      const res = await fetch(`${BASE_URL}/api/admin/${endpointMap[type]}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to delete ${type}`);
      }
      
      // Update the relevant state
      switch (type) {
        case 'incident':
          setIncidents(prev => prev.filter(i => i._id !== id));
          break;
        case 'discussion':
          setDiscussions(prev => prev.filter(d => d._id !== id));
          break;
        case 'story':
          setStories(prev => prev.filter(s => s._id !== id));
          break;
        case 'news':
          setNews(prev => prev.filter(n => n._id !== id));
          break;
        default:
          break;
      }
      
      alert(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
    } catch (err) {
      console.error(`Delete ${type} error:`, err);
      alert(err.message || `❌ Error deleting ${type}`);
    }
  };

  const handleVerifyItem = async (type, id, status) => {
    if (!token) return;
    
    try {
      const endpointMap = {
        story: 'stories',
        news: 'news'
      };
      
      const res = await fetch(`${BASE_URL}/api/admin/${endpointMap[type]}/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) {
        throw new Error(`Failed to update ${type} status`);
      }
      
      // Refresh data
      const refreshData = async () => {
     const [stoRes, nwsRes] = await Promise.all([
    fetch(`${BASE_URL}/api/stories`, { 
      headers: { Authorization: `Bearer ${token}` } 
    }),
    fetch(`${BASE_URL}/api/admin/news`, { 
      headers: { Authorization: `Bearer ${token}` } 
    })
  ]);

  const [stoData, nwsData] = await Promise.all([stoRes.json(), nwsRes.json()]);

  setStories(stoData);
  setNews(nwsData);
   };

      
      await refreshData();
      alert(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} status updated to ${status}`);
    } catch (err) {
      console.error(`Verify ${type} error:`, err);
      alert(err.message || `❌ Error updating ${type} status`);
    }
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '', role: '' });
    navigate('/admin');
  };

  // Dashboard Component
  const Dashboard = () => (
    <div className="super-admin-dashboard">
      <header className="dashboard-header">
        <h2>🛡️ AmaniLink Admin Dashboard</h2>
        <div className="user-info">
          <span>Welcome, {user?.username || 'Admin'}</span>
          <span>({user?.role || 'Unknown role'})</span>
          <button className="btn logout-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <>
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <div className="card-icon">🔥</div>
              <div className="card-title">Incidents</div>
              <div className="card-desc">
                Pending: {stats.pendingIncidents || 0} | Resolved: {stats.resolvedIncidents || 0}
              </div>
              <div className="card-value">{stats.incidentsCount || incidents.length}</div>
            </div>
            <div className="dashboard-card">
              <div className="card-icon">💬</div>
              <div className="card-title">Discussions</div>
              <div className="card-desc">Active threads</div>
              <div className="card-value">{discussions.length}</div>
            </div>
            <div className="dashboard-card">
              <div className="card-icon">📚</div>
              <div className="card-title">Stories</div>
              <div className="card-desc">Shared stories</div>
              <div className="card-value">{stories.length}</div>
            </div>
            <div className="dashboard-card">
              <div className="card-icon">📰</div>
              <div className="card-title">News</div>
              <div className="card-desc">Pending & verified news</div>
              <div className="card-value">{news.length}</div>
            </div>
          </div>

          {/* Incident Reports Section */}
          <DashboardSection 
            title="📍 Incident Reports"
            items={incidents}
            columns={[
              { header: '#', render: (_, idx) => idx + 1 },
              { header: 'Type', render: (i) => i.incidentType },
              { 
                header: 'Status', 
                render: (i) => (
                  <div className="status-buttons">
                    {['pending', 'investigating', 'resolved', 'escalated'].map((s) => (
                      <button
                        key={s}
                        className={`status-btn ${s} ${i.status === s ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(i._id, s);
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )
              },
              { header: 'Urgency', render: (i) => i.urgency },
              { header: 'Date', render: (i) => new Date(i.date).toLocaleDateString() },
              {
                header: 'Actions',
                render: (i) => (
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem('incident', i._id);
                    }}
                  >
                    🗑️
                  </button>
                )
              }
            ]}
            onRowClick={setSelectedIncident}
          />

          {/* Discussions Section */}
          <DashboardSection
            title="💬 Discussions"
            items={discussions}
            columns={[
              { header: '#', render: (_, idx) => idx + 1 },
              { header: 'Title', render: (d) => d.title },
              { header: 'Messages', render: (d) => d.messages?.length || 0 },
              { header: 'Date', render: (d) => new Date(d.createdAt).toLocaleDateString() },
              {
                header: 'Action',
                render: (d) => (
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem('discussion', d._id);
                    }}
                  >
                    🗑️
                  </button>
                )
              }
            ]}
            onRowClick={setSelectedDiscussion}
          />

          {/* Stories Section */}
          <DashboardSection
            title="📖 Stories"
            items={stories}
            columns={[
              { header: '#', render: (_, idx) => idx + 1 },
              { header: 'Title', render: (s) => s.title },
              { header: 'Status', render: (s) => s.status },
              { header: 'Date', render: (s) => new Date(s.createdAt).toLocaleDateString() },
              {
                header: 'Actions',
                render: (s) => (
                  <>
                    <button
                      className="verify-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerifyItem('story', s._id, 'verified');
                      }}
                    >
                      ✅
                    </button>
                    <button
                      className="reject-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerifyItem('story', s._id, 'rejected');
                      }}
                    >
                      ❌
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem('story', s._id);
                      }}
                    >
                      🗑️
                    </button>
                  </>
                )
              }
            ]}
            onRowClick={setSelectedStory}
          />

          {/* News Section */}
          <DashboardSection
            title="📰 News Management"
            items={news}
            columns={[
              { header: '#', render: (_, idx) => idx + 1 },
              { header: 'Title', render: (n) => n.title },
              { header: 'Status', render: (n) => n.status },
              { header: 'Date', render: (n) => new Date(n.createdAt).toLocaleDateString() },
              {
                header: 'Actions',
                render: (n) => (
                  <>
                    <button
                      className="verify-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerifyItem('news', n._id, 'verified');
                      }}
                    >
                      ✅
                    </button>
                    <button
                      className="reject-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVerifyItem('news', n._id, 'rejected');
                      }}
                    >
                      ❌
                    </button>
                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteItem('news', n._id);
                      }}
                    >
                      🗑️
                    </button>
                  </>
                )
              }
            ]}
            onRowClick={setSelectedNews}
          />
        </>
      )}

      {/* Modals */}
    <Modal 
  isOpen={!!selectedIncident}
  onClose={() => setSelectedIncident(null)}
  title="📍 Incident Details"
>
  {selectedIncident && (
    <>
      <p><strong>Type:</strong> {selectedIncident.incidentType}</p>
      <p><strong>Status:</strong> {selectedIncident.status}</p>
      <p><strong>Urgency:</strong> {selectedIncident.urgency}</p>
      <p><strong>Description:</strong> {selectedIncident.description}</p>
      <p><strong>Location:</strong> {selectedIncident.location}</p>
      <p><strong>Date:</strong> {new Date(selectedIncident.date).toLocaleString()}</p>
    </>
  )}
</Modal>

        isOpen={!!selectedDiscussion}
        onClose={() => setSelectedDiscussion(null)}
        title="💬 Discussion Details"
      >
        {selectedDiscussion && (
          <>
            <p><strong>Title:</strong> {selectedDiscussion.title}</p>
            <p><strong>Creator:</strong> {selectedDiscussion.creator?.username || 'Anonymous'}</p>
            <p><strong>Messages:</strong></p>
            <ul className="messages-list">
              {selectedDiscussion.messages?.map((m, i) => (
                <li key={i}>
                  <strong>{m.sender?.username || 'Anonymous'}:</strong> {m.text}
                </li>
              ))}
            </ul>
          </>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedStory}
        onClose={() => setSelectedStory(null)}
        title="📚 Story Details"
      >
        {selectedStory && (
          <>
            <p><strong>Title:</strong> {selectedStory.title}</p>
            <p><strong>Author:</strong> {selectedStory.author || 'Anonymous'}</p>
            <p><strong>Location:</strong> {selectedStory.location}</p>
            <p><strong>Category:</strong> {selectedStory.category}</p>
            <p><strong>Content:</strong> {selectedStory.content}</p>
            {selectedStory.imageUrl && (
              <img
                src={selectedStory.imageUrl}
                alt="Story"
                className="media-preview"
              />
            )}
            {selectedStory.videoUrl && (
              <iframe
                className="media-preview"
                src={selectedStory.videoUrl.replace("watch?v=", "embed/")}
                title="Story Video"
                allowFullScreen
              ></iframe>
            )}
          </>
        )}
      </Modal>

      <Modal
        isOpen={!!selectedNews}
        onClose={() => setSelectedNews(null)}
        title="📰 News Details"
      >
        {selectedNews && (
          <>
            <p><strong>Title:</strong> {selectedNews.title}</p>
            <p><strong>Source:</strong> {selectedNews.source || 'Unknown'}</p>
            <p><strong>Status:</strong> {selectedNews.status}</p>
            <p><strong>Content:</strong> {selectedNews.content}</p>
            {selectedNews.link && (
              <a href={selectedNews.link} target="_blank" rel="noopener noreferrer">
                Read more
              </a>
            )}
            {selectedNews.image && (
              <img
                src={selectedNews.image}
                alt="News"
                className="media-preview"
              />
            )}
          </>
        )}
      </Modal>
    </div>
  );

  // Reusable Components
 const DashboardSection = ({ title, items, columns, onRowClick }) => (
  <div className="dashboard-section">
    <h3>{title}</h3>
    <table className="pretty-incident-table">
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.isArray(items) && items.length > 0 ? (
          items.map((item, idx) => (
            <tr key={item._id || idx} onClick={() => onRowClick(item)}>
              {columns.map((col, colIdx) => (
                <td key={colIdx}>{col.render(item, idx)}</td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={columns.length} style={{ textAlign: 'center' }}>
              ⚠️ No data available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);


  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>{title}</h3>
          {children}
          <button className="btn close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  };

  // Main Render
  return (
    <div className="admin-container">
      {isLoading && !isLoggedIn ? (
        <div className="fullpage-loading">Loading...</div>
      ) : !isLoggedIn ? (
        showForgotPassword ? (
          <div className="auth-container">
            <h3>Reset Password</h3>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Your email"
              required
              disabled={isLoading}
            />
            <button 
              className="btn" 
              onClick={handlePasswordReset}
              disabled={isLoading || !resetEmail}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="auth-link" onClick={() => setShowForgotPassword(false)}>
              ← Back to login
            </p>
          </div>
        ) : showRegister ? (
          <div className="auth-container">
            <h2>Register Admin Account</h2>
            <form onSubmit={handleRegisterSubmit}>
              <input
                name="username"
                placeholder="Username"
                value={registerData.username}
                onChange={handleRegisterChange}
                required
                disabled={isLoading}
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={registerData.email}
                onChange={handleRegisterChange}
                required
                disabled={isLoading}
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={registerData.password}
                onChange={handleRegisterChange}
                required
                minLength="6"
                disabled={isLoading}
              />
              <select
                name="role"
                value={registerData.role}
                onChange={handleRegisterChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="super">Super Admin</option>
              </select>
              <select
                name="department"
                value={registerData.department}
                onChange={handleRegisterChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Department</option>
                <option value="Health">Health</option>
                <option value="Police">Police</option>
                <option value="Education">Education</option>
                <option value="Government">Government</option>
              </select>
              <button 
                className="btn" 
                type="submit"
                disabled={isLoading || !registerData.username || !registerData.email || 
                          !registerData.password || !registerData.role || !registerData.department}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
            <p className="auth-link">
              Already have an account?{' '}
              <span onClick={() => setShowRegister(false)}>Login here</span>
            </p>
          </div>
        ) : (
          <div className="auth-container">
            <h2>Admin Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <input
                name="username"
                placeholder="Username"
                value={loginData.username}
                onChange={handleLoginChange}
                required
                disabled={isLoading}
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                required
                disabled={isLoading}
              />
              <select
                name="role"
                value={loginData.role}
                onChange={handleLoginChange}
                required
                disabled={isLoading}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="super">Super Admin</option>
              </select>
              <button 
                className="btn" 
                type="submit"
                disabled={isLoading || !loginData.username || !loginData.password || !loginData.role}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <p className="auth-link">
              <span onClick={() => setShowForgotPassword(true)}>Forgot Password?</span>{' '}
              |{' '}
              <span onClick={() => setShowRegister(true)}>Register New Account</span>
            </p>
          </div>
        )
      ) : (
        <Dashboard />
      )}
    </div>
  );
};

export default Admin;
