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
        alert(`✅ Status changed to ${newStatus}`);
        setIncidents((prev) =>
          prev.map((i) => (i._id === id ? { ...i, status: newStatus } : i))
        );
      } else {
        alert(data.msg || '❌ Failed to change status');
      }
    } catch (err) {
      alert('❌ Status update error');
    }
  };

  const handleDeleteIncident = async (id) => {
    if (!window.confirm('❗ Confirm delete?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/report/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setIncidents((prev) => prev.filter((i) => i._id !== id));
        alert(data.msg);
      } else {
        alert(data.msg || '❌ Failed to delete');
      }
    } catch (err) {
      alert('❌ Delete error');
    }
  };

  const handleDeleteDiscussion = async (id) => {
    if (!window.confirm('❗ Confirm delete discussion?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/discussions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) => prev.filter((d) => d._id !== id));
        alert(data.msg);
      } else {
        alert(data.msg || '❌ Failed to delete discussion');
      }
    } catch (err) {
      alert('❌ Delete discussion error');
    }
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const formatted = {
      ...registerData,
      department: toProperCase(registerData.department),
    };
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formatted),
      });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Registered! Wait for approval.');
        setRegisterData({ username: '', email: '', password: '', role: '', department: '' });
        setShowRegister(false);
      } else {
        alert(data.msg || '❌ Registration failed');
      }
    } catch (err) {
      alert('❌ Registration error');
    }
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setSelectedCard(null);
    setLoginData({ username: '', password: '', role: '' });
  };

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
      {!isLoggedIn ? (
        showForgotPassword ? (
          <div className="container">
            <h3>Reset Password</h3>
            <input type="email" placeholder="Enter your email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
            <button className="btn" onClick={() => {
              alert(`📧 Password reset sent to: ${resetEmail}`);
              setResetEmail('');
              setShowForgotPassword(false);
            }}>Send Reset Link</button>
            <p onClick={() => setShowForgotPassword(false)}>← Back to Login</p>
          </div>
        ) : showRegister ? (
          <div className="container">
            <h2>Register</h2>
            <form onSubmit={handleRegisterSubmit}>
              <input type="text" name="username" placeholder="Username" value={registerData.username} onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })} required />
              <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} required />
              <input type="password" name="password" placeholder="Password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} required />
              <select name="role" value={registerData.role} onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })} required>
                <option value="">Select Role</option>
                <option value="super">Super Admin</option>
                <option value="admin">Admin</option>
              </select>
              {registerData.role === 'admin' && (
                <select name="department" value={registerData.department} onChange={(e) => setRegisterData({ ...registerData, department: e.target.value })} required>
                  <option value="">Select Department</option>
                  <option value="Security">Security</option>
                  <option value="Health">Health</option>
                  <option value="Peace">Peace</option>
                  <option value="Disaster">Disaster</option>
                  <option value="NGO">NGO</option>
                </select>
              )}
              <button type="submit" className="btn">Register</button>
            </form>
            <p>Already have an account? <span onClick={() => setShowRegister(false)}>Login</span></p>
          </div>
        ) : (
          <div className="container">
            <h2>Admin Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <input type="text" name="username" placeholder="Username" value={loginData.username} onChange={(e) => setLoginData({ ...loginData, username: e.target.value })} required />
              <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
              <select name="role" value={loginData.role} onChange={(e) => setLoginData({ ...loginData, role: e.target.value })} required>
                <option value="">Select Role</option>
                <option value="super">Super Admin</option>
                <option value="admin">Admin</option>
              </select>
              <button className="btn">Login</button>
            </form>
            <p><span onClick={() => setShowForgotPassword(true)}>Forgot Password?</span> | <span onClick={() => setShowRegister(true)}>Register</span></p>
          </div>
        )
      ) : (
        selectedCard === 'incidents' ? renderIncidentList() :
        selectedCard === 'discussions' ? renderDiscussionList() :
        renderDashboard()
      )}
    </div>
  );
};

export default Admin;
