import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Admin.css';
import '../components/styles/SuperAdminDashboard.css';
import { io } from 'socket.io-client';
import Dashboard from '../components/Dashboard'; // Make sure this file exists

const BASE_URL = 'https://backend-m6u3.onrender.com';
const socket = io(BASE_URL);

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_token'));
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
    if (!token) return;

    const fetchData = async () => {
      try {
        const endpoint = selectedCard === 'incidents'
          ? '/api/admin/report'
          : selectedCard === 'discussions'
          ? '/api/discussions'
          : null;
        if (!endpoint) return;

        const res = await fetch(`${BASE_URL}${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (selectedCard === 'incidents') setIncidents(data);
        if (selectedCard === 'discussions') setDiscussions(data);
      } catch (err) {
        console.error(`Error fetching ${selectedCard}`, err);
      }
    };

    fetchData();
  }, [selectedCard]);

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
        if (!data.admin?.approved) return alert('⛔ Your account is not approved yet.');
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
        alert('✅ Registered! Wait for approval.');
        setRegisterData({ username: '', email: '', password: '', role: '' });
        setShowRegister(false);
      } else {
        alert(data.msg || '❌ Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('❌ Registration error');
    }
  };

  const handleForgotPassword = () => {
    if (!resetEmail) return alert('⚠️ Please enter a valid email.');
    alert(`📧 Password reset link sent to: ${resetEmail}`);
    setResetEmail('');
    setShowForgotPassword(false);
  };

  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setSelectedCard(null);
    setLoginData({ username: '', password: '', role: '' });
  };

  return (
    <div className="admin-container">
      {isLoggedIn ? (
        <Dashboard
          token={token}
          stats={stats}
          incidents={incidents}
          discussions={discussions}
          setSelectedCard={setSelectedCard}
          selectedCard={selectedCard}
          setIncidents={setIncidents}
          setDiscussions={setDiscussions}
          handleStatusChange={handleStatusChange}
          handleDeleteIncident={handleDeleteIncident}
          handleDeleteDiscussion={handleDeleteDiscussion}
          logout={logout}
        />
      ) : showForgotPassword ? (
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
          <p>
            <span onClick={() => setShowForgotPassword(true)}>Forgot Password?</span> |
            <span onClick={() => setShowRegister(true)}> Register</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default Admin;
