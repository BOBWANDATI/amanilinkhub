import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Admin.css';
import '../components/styles/SuperAdminDashboard.css';
import { io } from 'socket.io-client';

const BASE_URL = 'https://backend-m6u3.onrender.com';

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
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [socket, setSocket] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

  // Initialize Socket once logged in
  useEffect(() => {
    if (isLoggedIn && !socket) {
      const newSocket = io(BASE_URL, {
        auth: { token },
        transports: ['websocket'],
      });
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [isLoggedIn, token]);

  // Fetch stats after login
  useEffect(() => {
    if (isLoggedIn && token) {
      fetch(`${BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setStats)
        .catch(console.error);
    }
  }, [isLoggedIn, token]);

  // Fetch initial data after login
  useEffect(() => {
    if (!isLoggedIn || !token) return;

    async function fetchData() {
      try {
        const [incRes, disRes, storyRes] = await Promise.all([
          fetch(`${BASE_URL}/api/admin/report`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/discussions`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/stories`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const incData = await incRes.json();
        const disData = await disRes.json();
        const storyData = await storyRes.json();

        setIncidents(incData);
        setDiscussions(disData);
        setStories(storyData);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, [isLoggedIn, token]);
// Socket event listeners for real-time updates
useEffect(() => {
  if (!socket) return;

  // 👇 Prevent duplicates by checking _id before appending
  const addOrUpdate = (prevList, newItem) => {
    const exists = prevList.find((i) => i._id === newItem._id);
    return exists ? prevList.map((i) => (i._id === newItem._id ? newItem : i)) : [newItem, ...prevList];
  };

  // ✅ Incident listeners
  const onNewIncident = (incident) => {
    setIncidents((prev) => addOrUpdate(prev, incident));
    alert(`🚨 New Incident Reported: ${incident.incidentType || 'Unknown'}`);
  };
  const onIncidentUpdated = (updated) => {
    setIncidents((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
  };

  // ✅ Discussion listeners
  const onNewDiscussion = (discussion) => {
    setDiscussions((prev) => addOrUpdate(prev, discussion));
    alert(`💬 New Discussion: ${discussion.title || 'Untitled'}`);
  };
  const onDiscussionUpdated = (updated) => {
    setDiscussions((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
  };

  // ✅ Story listeners (only if verified)
  const onNewStory = (story) => {
    if (story.verified) {
      setStories((prev) => addOrUpdate(prev, story));
      alert(`📚 New Story Shared: ${story.title || 'Untitled'}`);
    }
  };
  const onStoryUpdated = (updated) => {
    setStories((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
  };

  // 🔌 Register listeners
  socket.on('new_incident_reported', onNewIncident);
  socket.on('incident_updated', onIncidentUpdated);

  socket.on('new_discussion_created', onNewDiscussion);
  socket.on('discussion_updated', onDiscussionUpdated);

  socket.on('new_story_created', onNewStory);
  socket.on('story_updated', onStoryUpdated);

  // 🧹 Clean up listeners on unmount
  return () => {
    socket.off('new_incident_reported', onNewIncident);
    socket.off('incident_updated', onIncidentUpdated);
    socket.off('new_discussion_created', onNewDiscussion);
    socket.off('discussion_updated', onDiscussionUpdated);
    socket.off('new_story_created', onNewStory);
    socket.off('story_updated', onStoryUpdated);
  };
}, [socket]);

  // Show modal detail
  const showModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalType('');
  };

  // Update incident status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/report/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const updated = await res.json();
      setIncidents((prev) => prev.map((i) => (i._id === id ? updated : i)));
    } catch (e) {
      console.error(e);
    }
  };

  // Delete handlers
  const handleDeleteIncident = async (id) => {
    try {
      await fetch(`${BASE_URL}/api/admin/report/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents((prev) => prev.filter((i) => i._id !== id));
    } catch (e) {
      console.error(e);
    }
  };
  const handleDeleteDiscussion = async (id) => {
    try {
      await fetch(`${BASE_URL}/api/discussions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscussions((prev) => prev.filter((d) => d._id !== id));
    } catch (e) {
      console.error(e);
    }
  };
  const handleDeleteStory = async (id) => {
    try {
      await fetch(`${BASE_URL}/api/stories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setStories((prev) => prev.filter((s) => s._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('admin_token', data.token);
        setIsLoggedIn(true);
      } else if (data.msg?.toLowerCase().includes('pending approval')) {
        setLoginError('Your account is not approved yet. Please wait for approval.');
      } else {
        setLoginError(data.msg || 'Login failed. Check credentials.');
      }
    } catch (err) {
      setLoginError('Login failed due to server error.');
    }
    setLoading(false);
  };

  // Registration handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterMessage('');
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      setRegisterMessage(data.msg || 'Registration failed.');
      if (data.msg?.toLowerCase().includes('registered')) {
        setShowRegister(false);
      }
    } catch (err) {
      setRegisterMessage('Registration failed due to server error.');
    }
    setLoading(false);
  };

  // Controlled inputs
  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  // Logout
  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    if (socket) socket.disconnect();
    setSocket(null);
  };

  // Modal component
  const DetailModal = () => {
    if (!selectedItem) return null;
    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>
            {modalType === 'incident'
              ? 'Incident Details'
              : modalType === 'discussion'
              ? 'Discussion Details'
              : 'Story Details'}
          </h3>
          <pre>{JSON.stringify(selectedItem, null, 2)}</pre>
          <button onClick={closeModal}>Close</button>
        </div>
      </div>
    );
  };

  // Dashboard component
  const Dashboard = () => (
    <div className="super-admin-dashboard">
      <h2>🛡️ AmaniLink Admin Dashboard</h2>
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
        <button className="btn" onClick={logout}>
          Logout
        </button>
      </div>

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
            <tr key={i._id} onClick={() => showModal('incident', i)}>
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
            <tr key={d._id} onClick={() => showModal('discussion', d)}>
              <td>{idx + 1}</td>
              <td>{d.title}</td>
              <td>{d.messages?.length || 0}</td>
              <td>{new Date(d.createdAt).toLocaleDateString()}</td>
              <td>
                <button
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

      <h3>📚 Stories</h3>
      <table className="pretty-incident-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stories.map((s, idx) => (
            <tr key={s._id} onClick={() => showModal('story', s)}>
              <td>{idx + 1}</td>
              <td>{s.title || 'Untitled'}</td>
              <td>{new Date(s.date || s.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteStory(s._id);
                  }}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <DetailModal />
    </div>
  );

  // Main render
  return (
    <div className="admin-container">
      {!isLoggedIn ? (
        showForgotPassword ? (
          <div className="container">
            <h3>Reset Password</h3>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Your email"
            />
            <button className="btn" onClick={() => alert(`📧 Sent to ${resetEmail}`)}>
              Send
            </button>
            <p onClick={() => setShowForgotPassword(false)}>← Back to login</p>
          </div>
        ) : showRegister ? (
          <div className="container">
            <h2>Register</h2>
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
              />
              <select name="role" value={registerData.role} onChange={handleRegisterChange} required>
                <option value="">Role</option>
                <option value="admin">Admin</option>
                <option value="super">Super Admin</option>
              </select>
              <select
                name="department"
                value={registerData.department}
                onChange={handleRegisterChange}
                required
              >
                <option value="">Department</option>
                <option value="Health">Health</option>
                <option value="Police">Police</option>
              </select>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
            {registerMessage && <p className="info-message">{registerMessage}</p>}
            <p>
              Have an account? <span onClick={() => setShowRegister(false)}>Login</span>
            </p>
          </div>
        ) : (
          <div className="container">
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
              <select name="role" value={loginData.role} onChange={handleLoginChange} required>
                <option value="">Role</option>
                <option value="admin">Admin</option>
                <option value="super">Super Admin</option>
              </select>
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            {loginError && <p className="error-message">{loginError}</p>}
            <p>
              <span onClick={() => setShowForgotPassword(true)}>Forgot Password?</span> |{' '}
              <span onClick={() => setShowRegister(true)}>Register</span>
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
