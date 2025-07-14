import { useState, useEffect } from 'react';
import '../components/styles/Admin.css';
import '../components/styles/SuperAdminDashboard.css';
import { io } from 'socket.io-client';

const BASE_URL = 'https://backend-m6u3.onrender.com';
const socket = io(BASE_URL);

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_token'));
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '', role: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', role: '', department: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [stats, setStats] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [discussions, setDiscussions] = useState([]);

  const token = localStorage.getItem('admin_token');
  const user = JSON.parse(localStorage.getItem('admin_user'));
  const department = localStorage.getItem('admin_department');

  const toProperCase = (text) =>
    text ? text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '';

  useEffect(() => {
    if (isLoggedIn && token) {
      fetch(`${BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setStats)
        .catch(console.error);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    socket.on('new_incident_reported', (incident) => {
      if (selectedCard === 'incidents') {
        setIncidents((prev) => [incident, ...prev]);
        alert(`🚨 New Incident: ${incident.title}`);
      }
    });
    socket.on('incident_updated', (updated) => {
      setIncidents((prev) =>
        prev.map((i) => (i._id === updated._id ? updated : i))
      );
    });
    return () => {
      socket.off('new_incident_reported');
      socket.off('incident_updated');
    };
  }, [selectedCard]);

  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      try {
        if (selectedCard === 'incidents') {
          const res = await fetch(`${BASE_URL}/api/admin/report`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          const filtered =
            user?.role === 'super' ? data : data.filter((i) => i.department === department);
          setIncidents(filtered);
        } else if (selectedCard === 'discussions') {
          const res = await fetch(`${BASE_URL}/api/discussions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setDiscussions(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [selectedCard]);

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
        if (!data.admin?.approved) return alert('⛔ Not approved yet.');
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        localStorage.setItem('admin_department', data.admin.department || '');
        setIsLoggedIn(true);
        alert(`✅ Welcome ${data.admin.username}`);
      } else {
        alert(data.msg || '❌ Login failed');
      }
    } catch (err) {
      alert('❌ Login error');
    }
  };

  const handleLoginChange = (e) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const renderLogin = () => (
    <div className="container">
      <h2>Admin Login</h2>
      <form onSubmit={handleLoginSubmit}>
        <input type="text" name="username" placeholder="Username" value={loginData.username} onChange={handleLoginChange} required />
        <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required />
        <select name="role" value={loginData.role} onChange={handleLoginChange} required>
          <option value="">Select Role</option>
          <option value="super">Super Admin</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn">Login</button>
      </form>
      <p>
        <span onClick={() => setShowForgotPassword(true)}>Forgot Password?</span> |{' '}
        <span onClick={() => setShowRegister(true)}>Register</span>
      </p>
    </div>
  );

  const renderDashboard = () => (
    <div className="super-admin-dashboard">
      <h2>🛡️ AmaniLink Hub Dashboard</h2>
      <div className="dashboard-cards">
        <div className="dashboard-card" onClick={() => setSelectedCard('incidents')}>
          <div className="card-icon">🔥</div>
          <div className="card-title">Incidents</div>
          <div className="card-desc">🔴 {stats.pendingIncidents || 0} Pending<br />✅ {stats.resolvedIncidents || 0} Resolved</div>
          <div className="card-value">{stats.incidentsCount || incidents.length} Total</div>
        </div>
        {user?.role === 'super' && (
          <div className="dashboard-card" onClick={() => setSelectedCard('discussions')}>
            <div className="card-icon">💬</div>
            <div className="card-title">Discussions</div>
            <div className="card-desc">📢 Active</div>
            <div className="card-value">{discussions.length}</div>
          </div>
        )}
      </div>
      <button className="btn" onClick={() => {
        localStorage.clear();
        setIsLoggedIn(false);
        setSelectedCard(null);
      }}>
        Logout
      </button>
    </div>
  );

  const renderIncidentList = () => (
    <div className="incident-list">
      <h3>📍 Incident Reports</h3>
      {incidents.length === 0 ? (
        <p>No incidents available.</p>
      ) : (
        incidents.map((incident) => (
          <div key={incident._id} className="incident-card">
            <h4>{incident.title}</h4>
            <p><strong>Description:</strong> {incident.description}</p>
            <p><strong>Location:</strong> {incident.locationName || 'N/A'} ({incident.location?.lat}, {incident.location?.lng})</p>
            <p><strong>Status:</strong> <span className={`status ${incident.status}`}>{incident.status}</span></p>
            {incident.image && <img src={incident.image} alt="Incident" className="incident-image" />}
            <div className="incident-actions">
              <button onClick={() => handleStatusChange(incident._id, incident.status === 'pending' ? 'resolved' : 'pending')}>
                Mark as {incident.status === 'pending' ? 'Resolved' : 'Pending'}
              </button>
              <button onClick={() => handleDeleteIncident(incident._id)} className="delete-btn">🗑️ Delete</button>
            </div>
          </div>
        ))
      )}
      <button className="btn" onClick={() => setSelectedCard(null)}>← Back to Dashboard</button>
    </div>
  );

  const renderDiscussionList = () => (
    <div className="discussion-list">
      <h3>💬 Community Discussions</h3>
      {discussions.length === 0 ? (
        <p>No discussions available.</p>
      ) : (
        discussions.map((d) => (
          <div key={d._id} className="discussion-card">
            <h4>{d.title}</h4>
            <p><strong>Topic:</strong> {d.topic}</p>
            <p><strong>Messages:</strong> {d.messages?.length || 0}</p>
            <div className="discussion-actions">
              <button onClick={() => handleDeleteDiscussion(d._id)} className="delete-btn">🗑️ Delete</button>
            </div>
          </div>
        ))
      )}
      <button className="btn" onClick={() => setSelectedCard(null)}>← Back to Dashboard</button>
    </div>
  );

  return (
    <div className="admin-container">
      {!isLoggedIn
        ? renderLogin()
        : selectedCard === 'incidents'
          ? renderIncidentList()
          : selectedCard === 'discussions'
            ? renderDiscussionList()
            : renderDashboard()
      }
    </div>
  );
};

export default Admin;
