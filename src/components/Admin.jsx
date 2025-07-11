import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Admin.css';
import '../components/styles/SuperAdminDashboard.css';
import { io } from 'socket.io-client';

const BASE_URL = 'https://backend-m6u3.onrender.com';
const socket = io(BASE_URL); // Connect to socket server

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '', role: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', role: '' });
  const [resetEmail, setResetEmail] = useState('');
  const [stats, setStats] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      fetch(`${BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      })
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch((err) => console.error('Failed to fetch stats', err));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!socket) return;

    const handleNewIncident = (incident) => {
      if (selectedCard === 'incidents') {
        setIncidents((prev) => [incident, ...prev]);
        alert(`🚨 New Incident: ${incident.title}`);
      }
    };

    const handleIncidentUpdated = (updatedIncident) => {
      setIncidents((prev) =>
        prev.map((i) => (i._id === updatedIncident._id ? updatedIncident : i))
      );
    };

    socket.on('new_incident_reported', handleNewIncident);
    socket.on('incident_updated', handleIncidentUpdated);

    return () => {
      socket.off('new_incident_reported', handleNewIncident);
      socket.off('incident_updated', handleIncidentUpdated);
    };
  }, [selectedCard]);

  useEffect(() => {
    if (selectedCard === 'incidents') {
      fetch(`${BASE_URL}/api/admin/report`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      })
        .then((res) => res.json())
        .then((data) => setIncidents(data))
        .catch((err) => console.error('Failed to fetch incidents', err));
    } else if (selectedCard === 'discussions') {
      fetch(`${BASE_URL}/api/discussions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      })
        .then((res) => res.json())
        .then((data) => setDiscussions(data))
        .catch((err) => console.error('Failed to fetch discussions', err));
    }
  }, [selectedCard]);

  const handleDeleteIncident = async (id) => {
    if (!window.confirm('❗ Confirm delete?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/report/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      });
      const data = await res.json();
      if (res.ok) {
        setIncidents((prev) => prev.filter((i) => i._id !== id));
        alert(data.msg);
      } else {
        alert(data.msg || '❌ Failed to delete');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Delete error');
    }
  };

  const handleDeleteDiscussion = async (id) => {
    if (!window.confirm('❗ Confirm delete discussion?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/discussions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) => prev.filter((d) => d._id !== id));
        alert(data.msg);
      } else {
        alert(data.msg || '❌ Failed to delete discussion');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Delete discussion error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/report/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Status changed to ${newStatus}`);
        setIncidents((prev) =>
          prev.map((i) => (i._id === id ? { ...i, status: newStatus } : i))
        );
      } else {
        alert(data.msg || '❌ Failed to change status');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Status update error');
    }
  };

  const Dashboard = () => {
    const handleCardClick = (type) => setSelectedCard(type);
    const handleBack = () => setSelectedCard(null);

    if (selectedCard === 'incidents') {
      return (
        <div className="super-admin-dashboard">
          <h2>🔥 Incident Reports</h2>
          <table className="pretty-incident-table">
            <thead>
              <tr>
                <th>#</th><th>ID</th><th>Type</th><th>Status</th><th>Urgency</th><th>Reporter</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident, i) => (
                <tr key={incident._id}>
                  <td>{i + 1}</td>
                  <td>{incident._id.slice(0, 6)}...</td>
                  <td>{incident.incidentType || 'N/A'}</td>
                  <td>{['pending','investigating','resolved','escalated'].map((status) => (
                    <button key={status} className={`status-btn ${status} ${incident.status === status ? 'active' : ''}`} onClick={() => handleStatusChange(incident._id, status)}>{status}</button>
                  ))}</td>
                  <td>{incident.urgency || 'Normal'}</td>
                  <td>{incident.anonymous ? 'Anonymous' : incident.reportedBy || 'User'}</td>
                  <td>{new Date(incident.date).toLocaleDateString()}</td>
                  <td><button className="btn btn-delete" onClick={() => handleDeleteIncident(incident._id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn" onClick={handleBack}>← Back</button>
        </div>
      );
    }

    if (selectedCard === 'discussions') {
      return (
        <div className="super-admin-dashboard">
          <h2>💬 Discussions</h2>
          <table className="pretty-incident-table">
            <thead>
              <tr>
                <th>#</th><th>Title</th><th>Messages</th><th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {discussions.map((d, i) => (
                <tr key={d._id}>
                  <td>{i + 1}</td>
                  <td>{d.title}</td>
                  <td>{d.messages.length}</td>
                  <td>{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td><button className="btn btn-delete" onClick={() => handleDeleteDiscussion(d._id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn" onClick={handleBack}>← Back</button>
        </div>
      );
    }

    return (
      <div className="super-admin-dashboard">
        <h2>🛡️ AmaniLink Hub Dashboard</h2>
        <div className="dashboard-cards">
          <div className="dashboard-card" onClick={() => handleCardClick('incidents')}>
            <div className="card-icon">🔥</div>
            <div className="card-title">Incidents</div>
            <div className="card-desc">🔴 {stats.pendingIncidents || 0} Pending<br/>✅ {stats.resolvedIncidents || 0} Resolved</div>
            <div className="card-value">{stats.incidentsCount || 0} Total</div>
          </div>
          <div className="dashboard-card" onClick={() => handleCardClick('discussions')}>
            <div className="card-icon">💬</div>
            <div className="card-title">Discussions</div>
            <div className="card-desc">📢 Total</div>
            <div className="card-value">{discussions.length}</div>
          </div>
        </div>
        <button className="btn" onClick={logout}>Logout</button>
      </div>
    );
  };

  const handleForgotPassword = () => {
    alert(`📧 Password reset link sent to: ${resetEmail}`);
    setResetEmail('');
    setShowForgotPassword(false);
  };

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '', role: '' });
    setSelectedCard(null);
  };

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
        if (!data.admin.approved) return alert('⛔ Your account is not approved yet.');
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        setIsLoggedIn(true);
        alert(`✅ Welcome ${data.admin.username}`);
      } else alert(data.msg || 'Login failed');
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
        alert('✅ Registered! Wait for approval.');
        setRegisterData({ username: '', email: '', password: '', role: '' });
        setShowRegister(false);
      } else alert(data.msg || '❌ Registration failed');
    } catch (err) {
      console.error(err);
      alert('❌ Registration error');
    }
  };

  return (
    <div className="admin-container">
      {!isLoggedIn ? (
        showForgotPassword ? (
          <div className="container">
            <h3>Reset Password</h3>
            <input type="email" placeholder="Enter your email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
            <button className="btn" onClick={handleForgotPassword}>Send Reset Link</button>
            <p onClick={() => setShowForgotPassword(false)}>← Back to Login</p>
          </div>
        ) : showRegister ? (
          <div className="container">
            <h2>Register</h2>
            <form onSubmit={handleRegisterSubmit}>
              <input type="text" name="username" placeholder="Username" value={registerData.username} onChange={handleRegisterChange} required />
              <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleRegisterChange} required />
              <input type="password" name="password" placeholder="Password" value={registerData.password} onChange={handleRegisterChange} required />
              <select name="role" value={registerData.role} onChange={handleRegisterChange} required>
                <option value="">Select Role</option>
                <option value="super">Super Admin</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="btn">Register</button>
            </form>
            <p>Already have an account? <span onClick={() => setShowRegister(false)}>Login here</span></p>
          </div>
        ) : (
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
              <button type="submit" className="btn">Login</button>
            </form>
            <p><span onClick={() => setShowForgotPassword(true)}>Forgot Password?</span> | <span onClick={() => setShowRegister(true)}>Register</span></p>
          </div>
        )
      ) : <Dashboard />}
    </div>
  );
};

export default Admin;
