import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Admin.css';
import '../components/styles/SuperAdminDashboard.css';
import { io } from 'socket.io-client';

const BASE_URL = 'https://backend-m6u3.onrender.com';
const socket = io(BASE_URL);

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '', role: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', role: '', department: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [stats, setStats] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [stories, setStories] = useState([]);
  const [news, setNews] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

  // Check if user is already logged in on component mount
  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch stats when logged in
  useEffect(() => {
    if (isLoggedIn && token) {
      fetch(`${BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setStats)
        .catch((err) => console.error('Failed to fetch stats', err));
    }
  }, [isLoggedIn, token]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    
    const handleNewIncident = (incident) => {
      setIncidents((prev) => [incident, ...prev]);
      alert(`🚨 New Incident: ${incident.title}`);
    };
    
    const handleIncidentUpdated = (updated) => {
      setIncidents((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
    };
    
    socket.on("new_incident_reported", handleNewIncident);
    socket.on("incident_updated", handleIncidentUpdated);
    
    return () => {
      socket.off("new_incident_reported", handleNewIncident);
      socket.off("incident_updated", handleIncidentUpdated);
    };
  }, []);

  // Fetch all data
  const fetchData = async () => {
    if (!token || !isLoggedIn) return;
    
    try {
      const [inc, dis, sto, nws] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/report`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/discussions`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/stories`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/admin/news`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const incData = await inc.json();
      const disData = await dis.json();
      const stoData = await sto.json();
      const nwsData = await nws.json();

      setIncidents(incData);
      setDiscussions(disData);
      setStories(stoData);
      setNews(nwsData);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoggedIn, token]);

  // Handlers
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (res.ok) {
        if (!data.admin?.approved) return alert('⛔ Account not yet approved by admin');
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        setIsLoggedIn(true);
        alert(`✅ Welcome ${data.admin.username}`);
      } else {
        alert(data.msg || '❌ Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Login error');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Registered successfully. Please wait for admin approval');
        setShowRegister(false);
      } else {
        alert(data.msg || '❌ Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Registration error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
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
      if (res.ok) {
        alert(`✅ Status updated to ${newStatus}`);
        setIncidents((prev) =>
          prev.map((i) => (i._id === id ? { ...i, status: newStatus } : i))
        );
      } else {
        alert(data.msg || '❌ Status update failed');
      }
    } catch (err) {
      console.error('Status update error:', err);
      alert('❌ Error updating status');
    }
  };

  const handleDeleteIncident = async (id) => {
    if (!window.confirm("❗ Are you sure you want to delete this incident?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/report/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setIncidents((prev) => prev.filter((i) => i._id !== id));
        alert('✅ Incident deleted successfully');
      } else {
        alert(data.msg || '❌ Failed to delete incident');
      }
    } catch (err) {
      console.error('Error deleting incident:', err);
      alert('❌ Error occurred while deleting incident');
    }
  };

  const handleDeleteDiscussion = async (id) => {
    if (!window.confirm('❗ Are you sure you want to delete this discussion?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/discussions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) => prev.filter((d) => d._id !== id));
        alert('✅ Discussion deleted successfully');
      } else {
        alert(data.msg || '❌ Failed to delete discussion');
      }
    } catch (err) {
      console.error('Error deleting discussion:', err);
      alert('❌ Error occurred while deleting discussion');
    }
  };

  const handleNewsVerify = async (id, status) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/news/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchData();
        alert(`✅ News status updated to ${status}`);
      } else {
        alert('❌ Failed to update news status');
      }
    } catch (err) {
      console.error('Error verifying news:', err);
      alert('❌ Error updating news status');
    }
  };

  const handleNewsDelete = async (id) => {
    if (!window.confirm('❗ Are you sure you want to delete this news item?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/news/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
        alert('✅ News deleted successfully');
      } else {
        alert('❌ Failed to delete news');
      }
    } catch (err) {
      console.error('Error deleting news:', err);
      alert('❌ Error occurred while deleting news');
    }
  };

  const handleStoryVerify = async (id, status) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/stories/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchData();
        alert(`✅ Story status updated to ${status}`);
      } else {
        alert('❌ Failed to update story status');
      }
    } catch (err) {
      console.error('Error verifying story:', err);
      alert('❌ Error updating story status');
    }
  };

  const handleStoryDelete = async (id) => {
    if (!window.confirm('❗ Are you sure you want to delete this story?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/stories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchData();
        alert('✅ Story deleted successfully');
      } else {
        alert('❌ Failed to delete story');
      }
    } catch (err) {
      console.error('Error deleting story:', err);
      alert('❌ Error occurred while deleting story');
    }
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '', role: '' });
    navigate('/admin');
  };

  const Dashboard = () => (
    <div className="super-admin-dashboard">
      <h2>🛡️ AmaniLink Admin Dashboard</h2>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <div className="card-icon">🔥</div>
          <div className="card-title">Incidents</div>
          <div className="card-desc">Pending: {stats.pendingIncidents || 0} | Resolved: {stats.resolvedIncidents || 0}</div>
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

      <button className="btn logout-btn" onClick={logout}>Logout</button>

      {/* Incident Modals */}
      {selectedIncident && (
        <div className="modal">
          <div className="modal-content">
            <h3>📍 Incident Details</h3>
            <p><strong>Title:</strong> {selectedIncident.title}</p>
            <p><strong>Type:</strong> {selectedIncident.incidentType}</p>
            <p><strong>Status:</strong> {selectedIncident.status}</p>
            <p><strong>Urgency:</strong> {selectedIncident.urgency}</p>
            <p><strong>Description:</strong> {selectedIncident.description}</p>
            <p><strong>Location:</strong> {selectedIncident.location}</p>
            <p><strong>Date:</strong> {new Date(selectedIncident.date).toLocaleString()}</p>
            <button className="btn" onClick={() => setSelectedIncident(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Discussion Modals */}
      {selectedDiscussion && (
        <div className="modal">
          <div className="modal-content">
            <h3>💬 Discussion Details</h3>
            <p><strong>Title:</strong> {selectedDiscussion.title}</p>
            <p><strong>Creator:</strong> {selectedDiscussion.creator?.username || 'Anonymous'}</p>
            <p><strong>Messages:</strong></p>
            <ul>
              {selectedDiscussion.messages?.map((m, i) => (
                <li key={i}>
                  <strong>{m.sender?.username || 'Anonymous'}:</strong> {m.text}
                </li>
              ))}
            </ul>
            <button className="btn" onClick={() => setSelectedDiscussion(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Story Modals */}
      {selectedStory && (
        <div className="modal">
          <div className="modal-content">
            <h3>📚 Story Details</h3>
            <p><strong>Title:</strong> {selectedStory.title}</p>
            <p><strong>Author:</strong> {selectedStory.author || 'Anonymous'}</p>
            <p><strong>Location:</strong> {selectedStory.location}</p>
            <p><strong>Category:</strong> {selectedStory.category}</p>
            <p><strong>Content:</strong> {selectedStory.content}</p>
            {selectedStory.imageUrl && (
              <img 
                src={selectedStory.imageUrl} 
                alt="Story" 
                style={{ maxWidth: '100%', marginTop: '1rem' }} 
              />
            )}
            {selectedStory.videoUrl && (
              <iframe
                width="100%"
                height="300"
                src={selectedStory.videoUrl.replace("watch?v=", "embed/")}
                frameBorder="0"
                allowFullScreen
                title="Story Video"
                style={{ marginTop: '1rem' }}
              ></iframe>
            )}
            <button className="btn" onClick={() => setSelectedStory(null)}>Close</button>
          </div>
        </div>
      )}

      {/* News Modals */}
      {selectedNews && (
        <div className="modal">
          <div className="modal-content">
            <h3>📰 News Details</h3>
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
                style={{ maxWidth: '100%', marginTop: '1rem' }} 
              />
            )}
            <button className="btn" onClick={() => setSelectedNews(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Incident Table */}
      <div className="dashboard-section">
        <h3>📍 Incident Reports</h3>
        <table className="pretty-incident-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Type</th>
              <th>Status</th>
              <th>Urgency</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((i, idx) => (
              <tr key={i._id} onClick={() => setSelectedIncident(i)}>
                <td>{idx + 1}</td>
                <td>{i.incidentType}</td>
                <td>
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
                </td>
                <td>{i.urgency}</td>
                <td>{new Date(i.date).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="delete-btn"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleDeleteIncident(i._id); 
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Discussions Table */}
      <div className="dashboard-section">
        <h3>💬 Discussions</h3>
        <table className="pretty-incident-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Messages</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {discussions.map((d, idx) => (
              <tr key={d._id} onClick={() => setSelectedDiscussion(d)}>
                <td>{idx + 1}</td>
                <td>{d.title}</td>
                <td>{d.messages?.length || 0}</td>
                <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="delete-btn"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleDeleteDiscussion(d._id); 
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Story Table */}
      <div className="dashboard-section">
        <h3>📖 Stories</h3>
        <table className="pretty-incident-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((story, idx) => (
              <tr key={story._id} onClick={() => setSelectedStory(story)}>
                <td>{idx + 1}</td>
                <td>{story.title}</td>
                <td>{story.status}</td>
                <td>{new Date(story.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="verify-btn"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleStoryVerify(story._id, 'verified'); 
                    }}
                  >
                    ✅
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleStoryVerify(story._id, 'rejected'); 
                    }}
                  >
                    ❌
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleStoryDelete(story._id); 
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* News Table */}
      <div className="dashboard-section">
        <h3>📰 News Management</h3>
        <table className="pretty-incident-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {news.map((n, idx) => (
              <tr key={n._id} onClick={() => setSelectedNews(n)}>
                <td>{idx + 1}</td>
                <td>{n.title}</td>
                <td>{n.status}</td>
                <td>{new Date(n.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="verify-btn"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleNewsVerify(n._id, 'verified'); 
                    }}
                  >
                    ✅
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleNewsVerify(n._id, 'rejected'); 
                    }}
                  >
                    ❌
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleNewsDelete(n._id); 
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      {!isLoggedIn ? (
        showForgotPassword ? (
          <div className="auth-container">
            <h3>Reset Password</h3>
            <input 
              type="email" 
              value={resetEmail} 
              onChange={(e) => setResetEmail(e.target.value)} 
              placeholder="Your email" 
              required
            />
            <button className="btn" onClick={() => {
              alert(`📧 Password reset link sent to ${resetEmail}`);
              setShowForgotPassword(false);
            }}>
              Send Reset Link
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
              />
              <input 
                name="email" 
                type="email" 
                placeholder="Email" 
                value={registerData.email} 
                onChange={handleRegisterChange} 
                required 
              />
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                value={registerData.password} 
                onChange={handleRegisterChange} 
                required 
                minLength="6"
              />
              <select 
                name="role" 
                value={registerData.role} 
                onChange={handleRegisterChange} 
                required
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
              >
                <option value="">Select Department</option>
                <option value="Health">Health</option>
                <option value="Police">Police</option>
                <option value="Education">Education</option>
                <option value="Government">Government</option>
              </select>
              <button className="btn" type="submit">Register</button>
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
              />
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                value={loginData.password} 
                onChange={handleLoginChange} 
                required 
              />
              <select 
                name="role" 
                value={loginData.role} 
                onChange={handleLoginChange} 
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="super">Super Admin</option>
              </select>
              <button className="btn" type="submit">Login</button>
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
