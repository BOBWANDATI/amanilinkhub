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
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

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

  // Socket.io event listeners for real-time updates on incidents, discussions, stories
  useEffect(() => {
    if (!socket) return;

    // Incidents
    const handleNewIncident = (incident) => {
      setIncidents((prev) => [incident, ...prev]);
      alert(`🚨 New Incident: ${incident.title || incident.incidentType || 'Unknown'}`);
    };

    const handleIncidentUpdated = (updated) => {
      setIncidents((prev) => prev.map((i) => (i._id === updated._id ? updated : i)));
    };

    // Discussions
    const handleNewDiscussion = (discussion) => {
      setDiscussions((prev) => [discussion, ...prev]);
      alert(`💬 New Discussion: ${discussion.title || 'Untitled'}`);
    };

    const handleDiscussionUpdated = (updated) => {
      setDiscussions((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
    };

    // Stories
    const handleNewStory = (story) => {
      setStories((prev) => [story, ...prev]);
      alert(`📚 New Story: ${story.title || 'Untitled'}`);
    };

    const handleStoryUpdated = (updated) => {
      setStories((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
    };

    socket.on('new_incident_reported', handleNewIncident);
    socket.on('incident_updated', handleIncidentUpdated);
    socket.on('new_discussion_created', handleNewDiscussion);
    socket.on('discussion_updated', handleDiscussionUpdated);
    socket.on('new_story_created', handleNewStory);
    socket.on('story_updated', handleStoryUpdated);

    return () => {
      socket.off('new_incident_reported', handleNewIncident);
      socket.off('incident_updated', handleIncidentUpdated);
      socket.off('new_discussion_created', handleNewDiscussion);
      socket.off('discussion_updated', handleDiscussionUpdated);
      socket.off('new_story_created', handleNewStory);
      socket.off('story_updated', handleStoryUpdated);
    };
  }, []);

  // Fetch incidents, discussions, stories after login
  useEffect(() => {
    if (!token || !isLoggedIn) return;

    const fetchData = async () => {
      try {
        const [incRes, disRes, storyRes] = await Promise.all([
          fetch(`${BASE_URL}/api/admin/report`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/api/discussions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${BASE_URL}/api/stories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const incData = await incRes.json();
        const disData = await disRes.json();
        const storyData = await storyRes.json();

        setIncidents(incData);
        setDiscussions(disData);
        setStories(storyData);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchData();
  }, [isLoggedIn, token]);

  // Show modal details
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const updatedIncident = await res.json();

      setIncidents((prev) =>
        prev.map((i) => (i._id === id ? updatedIncident : i))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
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
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDeleteDiscussion = async (id) => {
    try {
      await fetch(`${BASE_URL}/api/discussions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setDiscussions((prev) => prev.filter((d) => d._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDeleteStory = async (id) => {
    try {
      await fetch(`${BASE_URL}/api/stories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setStories((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Modal component for details
  const DetailModal = () => {
    if (!selectedItem) return null;
    const item = selectedItem;
    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>
            {modalType === 'incident'
              ? 'Incident Detail'
              : modalType === 'discussion'
              ? 'Discussion Detail'
              : 'Story Detail'}
          </h3>
          <pre>{JSON.stringify(item, null, 2)}</pre>
          <button onClick={closeModal}>Close</button>
        </div>
      </div>
    );
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  };

  // Dashboard view
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
              <td>{new Date(s.date).toLocaleDateString()}</td>
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

  // Handle login submission
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
      } else if (data.msg && data.msg.toLowerCase().includes('pending approval')) {
        setLoginError('Your account is not approved yet. Please wait for approval.');
      } else {
        setLoginError(data.msg || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setLoginError('Login failed due to a server error.');
      console.error(err);
    }
    setLoading(false);
  };

  // Handle registration submission
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

      if (data.msg) {
        setRegisterMessage(data.msg);
        if (data.msg.toLowerCase().includes('registered')) {
          setShowRegister(false);
        }
      } else {
        setRegisterMessage('Registration failed.');
      }
    } catch (err) {
      setRegisterMessage('Registration failed due to a server error.');
      console.error(err);
    }
    setLoading(false);
  };

  // Controlled input handlers
  const handleLoginChange = (e) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleRegisterChange = (e) =>
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });

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
