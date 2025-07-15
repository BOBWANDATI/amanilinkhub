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

  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (isLoggedIn && token) {
      fetch(`${BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setStats)
        .catch((err) => console.error('Failed to fetch stats', err));
    }
  }, [isLoggedIn]);

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
          })
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
  }, [isLoggedIn]);

  const showModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalType('');
  };

  //DETAIL MODAL

const DetailModal = () => {
    if (!selectedItem) return null;
    const item = selectedItem;
    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <h3>{modalType === 'incident' ? 'Incident Detail' : modalType === 'discussion' ? 'Discussion Detail' : 'Story Detail'}</h3>
          <pre>{JSON.stringify(item, null, 2)}</pre>
          <button onClick={closeModal}>Close</button>
        </div>
      </div>
    );
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
        <button className="btn" onClick={logout}>Logout</button>
      </div>

      <h3>📍 Incident Reports</h3>
      <table className="pretty-incident-table">
        <thead>
          <tr><th>#</th><th>Type</th><th>Status</th><th>Urgency</th><th>Date</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {incidents.map((i, idx) => (
            <tr key={i._id} onClick={() => showModal('incident', i)}>
              <td>{idx + 1}</td>
              <td>{i.incidentType}</td>
              <td>{['pending', 'investigating', 'resolved', 'escalated'].map((s) => (
                <button key={s} className={`status-btn ${s} ${i.status === s ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleStatusChange(i._id, s); }}>{s}</button>
              ))}</td>
              <td>{i.urgency}</td>
              <td>{new Date(i.date).toLocaleDateString()}</td>
              <td><button onClick={(e) => { e.stopPropagation(); handleDeleteIncident(i._id); }}>🗑️</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>💬 Discussions</h3>
      <table className="pretty-incident-table">
        <thead><tr><th>#</th><th>Title</th><th>Messages</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          {discussions.map((d, idx) => (
            <tr key={d._id} onClick={() => showModal('discussion', d)}>
              <td>{idx + 1}</td>
              <td>{d.title}</td>
              <td>{d.messages?.length || 0}</td>
              <td>{new Date(d.createdAt).toLocaleDateString()}</td>
              <td><button onClick={(e) => { e.stopPropagation(); handleDeleteDiscussion(d._id); }}>🗑️</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>📚 Stories</h3>
      <table className="pretty-incident-table">
        <thead><tr><th>#</th><th>Title</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {stories.map((s, idx) => (
            <tr key={s._id} onClick={() => showModal('story', s)}>
              <td>{idx + 1}</td>
              <td>{s.title || 'Untitled'}</td>
              <td>{new Date(s.date).toLocaleDateString()}</td>
              <td><button onClick={(e) => { e.stopPropagation(); handleDeleteStory(s._id); }}>🗑️</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <DetailModal />
    </div>
  );

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
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
      } else {
        alert('Login failed');
      }
    } catch (err) {
      console.error(err);
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
      alert(data.message || 'Registered');
      setShowRegister(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`${BASE_URL}/api/admin/report/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteIncident = async (id) => {
    try {
      await fetch(`${BASE_URL}/api/admin/report/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncidents(incidents.filter(i => i._id !== id));
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
      setDiscussions(discussions.filter(d => d._id !== id));
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
      setStories(stories.filter(s => s._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
  };

  return (
    <div className="admin-container">
      {!isLoggedIn ? (
        showForgotPassword ? (
          <div className="container">
            <h3>Reset Password</h3>
            <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="Your email" />
            <button className="btn" onClick={() => alert(`📧 Sent to ${resetEmail}`)}>Send</button>
            <p onClick={() => setShowForgotPassword(false)}>← Back to login</p>
          </div>
        ) : showRegister ? (
          <div className="container">
            <h2>Register</h2>
            <form onSubmit={handleRegisterSubmit}>
              <input name="username" placeholder="Username" value={registerData.username} onChange={handleRegisterChange} required />
              <input name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} required />
              <input name="password" type="password" placeholder="Password" value={registerData.password} onChange={handleRegisterChange} required />
              <select name="role" value={registerData.role} onChange={handleRegisterChange} required>
                <option value="">Role</option>
                <option value="admin">Admin</option>
                <option value="super">Super Admin</option>
              </select>
              <select name="department" value={registerData.department} onChange={handleRegisterChange} required>
                <option value="">Department</option>
                <option value="Health">Health</option>
                <option value="Police">Police</option>
              </select>
              <button className="btn" type="submit">Register</button>
            </form>
            <p>Have an account? <span onClick={() => setShowRegister(false)}>Login</span></p>
          </div>
        ) : (
          <div className="container">
            <h2>Admin Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <input name="username" placeholder="Username" value={loginData.username} onChange={handleLoginChange} required />
              <input name="password" type="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required />
              <select name="role" value={loginData.role} onChange={handleLoginChange} required>
                <option value="">Role</option>
                <option value="admin">Admin</option>
                <option value="super">Super Admin</option>
              </select>
              <button className="btn" type="submit">Login</button>
            </form>
            <p><span onClick={() => setShowForgotPassword(true)}>Forgot Password?</span> | <span onClick={() => setShowRegister(true)}>Register</span></p>
          </div>
        )
      ) : (
        <Dashboard />
      )}
    </div>
  );
};

export default Admin;
