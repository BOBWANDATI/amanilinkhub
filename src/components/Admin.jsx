import { useState, useEffect } from 'react';
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
  const [loginData, setLoginData] = useState({ username: '', password: '', role: 'admin' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '', role: 'admin' });
  const [resetEmail, setResetEmail] = useState('');
  const [stats, setStats] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [discussions, setDiscussions] = useState([]);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.msg || 'Login failed');
      localStorage.setItem('admin_token', data.token);
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      alert('Login error');
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/api/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.msg || 'Registration failed');
      alert('Registered! You can now login.');
      setShowRegister(false);
    } catch (err) {
      console.error(err);
      alert('Registration error');
    }
  };

  // Load stats
  useEffect(() => {
    if (isLoggedIn) {
      fetch(`${BASE_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      })
        .then(res => res.json())
        .then(setStats)
        .catch(console.error);
    }
  }, [isLoggedIn]);

  // Socket events
  useEffect(() => {
    if (selectedCard !== 'incidents') return;
    const newIncHandler = data => setIncidents(prev => [data, ...prev]);
    const updIncHandler = data => setIncidents(prev => prev.map(i => i._id === data._id ? data : i));
    socket.on('new_incident_reported', newIncHandler);
    socket.on('incident_updated', updIncHandler);
    return () => {
      socket.off('new_incident_reported', newIncHandler);
      socket.off('incident_updated', updIncHandler);
    };
  }, [selectedCard]);

  // Fetch incident/discussions
  useEffect(() => {
    if (!isLoggedIn) return;
    const token = localStorage.getItem('admin_token');

    if (selectedCard === 'incidents') {
      fetch(`${BASE_URL}/api/admin/report`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setIncidents)
        .catch(console.error);
    }
    if (selectedCard === 'discussions') {
      fetch(`${BASE_URL}/api/discussions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setDiscussions)
        .catch(console.error);
    }
  }, [selectedCard, isLoggedIn]);

  const deleteDiscussion = async id => {
    if (!confirm('Delete this discussion?')) return;
    const res = await fetch(`${BASE_URL}/api/discussions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
    });
    const { msg } = await res.json();
    if (res.ok) setDiscussions(d => d.filter(x => x._id !== id));
    alert(msg);
  };

  const deleteIncident = async id => {
    if (!confirm('Delete this incident?')) return;
    const res = await fetch(`${BASE_URL}/api/admin/report/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
    });
    const { msg } = await res.json();
    if (res.ok) setIncidents(i => i.filter(x => x._id !== id));
    alert(msg);
  };

  const changeStatus = async (id, status) => {
    const res = await fetch(`${BASE_URL}/api/admin/report/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`
      },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (res.ok) {
      setIncidents(i => i.map(x => x._id === id ? data : x));
      alert(`Status set to ${status}`);
    } else alert(data.msg);
  };

  const Dashboard = () => (
    <div className="super-admin-dashboard">
      {!selectedCard ? (
        <>
          <h2>🛡️ AmaniLink Hub Dashboard</h2>
          <div className="dashboard-cards">
            <div className="dashboard-card" onClick={() => setSelectedCard('incidents')}>
              <div className="card-icon">🔥</div>
              <div className="card-title">Incidents</div>
              <div className="card-value">{stats.incidentsCount || 0}</div>
            </div>
            <div className="dashboard-card" onClick={() => setSelectedCard('discussions')}>
              <div className="card-icon">💬</div>
              <div className="card-title">Discussions</div>
              <div className="card-value">{discussions.length || 0}</div>
            </div>
          </div>
          <button className="btn" onClick={() => {
            localStorage.clear();
            setIsLoggedIn(false);
            setSelectedCard(null);
          }}>Logout</button>
        </>
      ) : selectedCard === 'incidents' ? (
        <>
          <h2>🔥 Incident Reports</h2>
          <table className="pretty-incident-table">
            <thead>
              <tr>
                <th>#</th><th>ID</th><th>Type</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc, i) => (
                <tr key={inc._id}>
                  <td>{i + 1}</td>
                  <td>{inc._id.slice(0, 6)}...</td>
                  <td>{inc.incidentType}</td>
                  <td>{inc.status}</td>
                  <td>
                    <button onClick={() => changeStatus(inc._id, 'resolved')} className="btn">Resolve</button>
                    <button onClick={() => deleteIncident(inc._id)} className="btn btn-delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn" onClick={() => setSelectedCard(null)}>← Back</button>
        </>
      ) : (
        <>
          <h2>💬 All Discussions</h2>
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
                  <td><button onClick={() => deleteDiscussion(d._id)} className="btn btn-delete">🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn" onClick={() => setSelectedCard(null)}>← Back</button>
        </>
      )}
    </div>
  );

  return (
    <div className="admin-container">
      {!isLoggedIn ? (
        showForgotPassword ? (
          <div className="container">
            <h3>Reset Password</h3>
            <input placeholder="Email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
            <button className="btn" onClick={() => {
              alert(`Reset link sent to ${resetEmail}`);
              setShowForgotPassword(false);
            }}>Send</button>
            <p onClick={() => setShowForgotPassword(false)}>← Back</p>
          </div>
        ) : showRegister ? (
          <div className="container">
            <h2>Register</h2>
            <form onSubmit={handleRegisterSubmit}>
              <input placeholder="Username" required onChange={e => setRegisterData({ ...registerData, username: e.target.value })} />
              <input placeholder="Email" type="email" required onChange={e => setRegisterData({ ...registerData, email: e.target.value })} />
              <input placeholder="Password" type="password" required onChange={e => setRegisterData({ ...registerData, password: e.target.value })} />
              <select onChange={e => setRegisterData({ ...registerData, role: e.target.value })} required>
                <option value="admin">Admin</option>
                <option value="super">Super Admin</option>
              </select>
              <button type="submit" className="btn">Register</button>
            </form>
            <p><span onClick={() => setShowRegister(false)}>Login</span></p>
          </div>
        ) : (
          <div className="container">
            <h2>Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <input placeholder="Username" required onChange={e => setLoginData({ ...loginData, username: e.target.value })} />
              <input placeholder="Password" type="password" required onChange={e => setLoginData({ ...loginData, password: e.target.value })} />
              <select onChange={e => setLoginData({ ...loginData, role: e.target.value })} required>
                <option value="admin">Admin</option>
                <option value="super">Super Admin</option>
              </select>
              <button type="submit" className="btn">Login</button>
            </form>
            <p>
              <span onClick={() => setShowForgotPassword(true)}>Forgot?</span> | 
              <span onClick={() => setShowRegister(true)}>Register</span>
            </p>
          </div>
        )
      ) : <Dashboard />}
    </div>
  );
};

export default Admin;
