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
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
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

  const handleIncidentClick = (incident) => {
    setSelectedIncident(incident);
  };

  const IncidentDetail = () => (
    <div className="incident-detail">
      <h3>📝 Incident Details</h3>
      <p><strong>ID:</strong> {selectedIncident._id}</p>
      <p><strong>Type:</strong> {selectedIncident.incidentType}</p>
      <p><strong>Status:</strong> {selectedIncident.status}</p>
      <p><strong>Urgency:</strong> {selectedIncident.urgency}</p>
      <p><strong>Reporter:</strong> {selectedIncident.anonymous ? 'Anonymous' : selectedIncident.reportedBy}</p>
      <p><strong>Date:</strong> {new Date(selectedIncident.date).toLocaleString()}</p>
      <p><strong>Description:</strong> {selectedIncident.description}</p>
      <p><strong>Location:</strong> {selectedIncident.locationName}</p>
      <p><strong>Coordinates:</strong> {selectedIncident.latitude}, {selectedIncident.longitude}</p>
      <button className="btn" onClick={() => setSelectedIncident(null)}>← Back to Incidents</button>
    </div>
  );

  const Dashboard = () => {
    if (selectedIncident) return <IncidentDetail />;

    if (selectedCard === 'incidents') {
      return (
        <div className="super-admin-dashboard">
          <h2>🔥 Incident Reports</h2>
          <table className="pretty-incident-table">
            <thead>
              <tr>
                <th>#</th><th>ID</th><th>Type</th><th>Status</th><th>Urgency</th><th>Reporter</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((incident, i) => (
                <tr key={incident._id} onClick={() => handleIncidentClick(incident)} className="clickable-row">
                  <td>{i + 1}</td>
                  <td>{incident._id.slice(0, 6)}...</td>
                  <td>{incident.incidentType || 'N/A'}</td>
                  <td>{incident.status}</td>
                  <td>{incident.urgency || 'Normal'}</td>
                  <td>{incident.anonymous ? 'Anonymous' : incident.reportedBy || 'User'}</td>
                  <td>{new Date(incident.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn" onClick={() => setSelectedCard(null)}>← Back</button>
        </div>
      );
    }

    return (
      <div className="super-admin-dashboard">
        <h2>🛡️ AmaniLink Hub Dashboard</h2>
        <div className="dashboard-cards">
          <div className="dashboard-card" onClick={() => setSelectedCard('incidents')}>
            <div className="card-icon">🔥</div>
            <div className="card-title">Incidents</div>
            <div className="card-desc">🔴 {stats.pendingIncidents || 0} Pending<br/>✅ {stats.resolvedIncidents || 0} Resolved</div>
            <div className="card-value">{stats.incidentsCount || 0} Total</div>
          </div>
        </div>
        <button className="btn" onClick={() => {
          localStorage.clear();
          setIsLoggedIn(false);
        }}>Logout</button>
      </div>
    );
  };

  const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });

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
        setIsLoggedIn(true);
      } else alert(data.msg || 'Login failed');
    } catch (err) {
      console.error(err);
      alert('❌ Login error');
    }
  };

  return (
    <div className="admin-container">
      {!isLoggedIn ? (
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
        </div>
      ) : <Dashboard />}
    </div>
  );
};

export default Admin;
