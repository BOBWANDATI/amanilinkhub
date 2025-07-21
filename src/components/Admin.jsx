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
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('admin_token');
  
  //NEWS UPDATE
  //const [news, setNews] = useState([]);
  //const [selectedNews, setSelectedNews] = useState(null);

  const [news, setNews] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);

  






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
  }, [isLoggedIn]);

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

  // Fetch incidents, discussions, stories
useEffect(() => {
  if (!token || !isLoggedIn) return;

// ✅ Move fetchData to top level
const fetchData = async () => {
  if (!token || !isLoggedIn) return;
  try {
   const fetchData = async () => {
  if (!token) return;
  try {
    const [inc, dis, nws, sto] = await Promise.all([
      fetch(`${BASE_URL}/api/admin/report`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/api/discussions`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/api/admin/news`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${BASE_URL}/api/admin/stories`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    const [incidentsData, discussionsData, newsData, storiesData] = await Promise.all([
      inc.json(), dis.json(), nws.json(), sto.json(),
    ]);
    setIncidents(incidentsData);
    setDiscussions(discussionsData);
    setNews(newsData);
    setStories(storiesData);
  } catch (err) {
    console.error('Fetch error:', err);
  }
};

useEffect(() => {
  if (isLoggedIn) fetchData();
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
        if (!data.admin?.approved) return alert('⛔ Not approved');
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.admin));
        setIsLoggedIn(true);
        alert(`✅ Welcome ${data.admin.username}`);
      } else alert(data.msg || '❌ Login failed');
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
        alert('✅ Registered. Wait for approval');
        setShowRegister(false);
      } else alert(data.msg || '❌ Failed to register');
    } catch (err) {
      console.error(err);
      alert('❌ Error');
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
      } else alert(data.msg || '❌ Status update failed');
    } catch (err) {
      console.error('❌ Status error:', err);
      alert('❌ Status error');
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
        console.error('Delete error:', data);
        alert(data.msg || '❌ Failed to delete incident');
      }
    } catch (err) {
      console.error('❌ Error deleting incident:', err);
      alert('❌ Error occurred while deleting incident');
    }
  };

  const handleDeleteDiscussion = async (id) => {
    if (!window.confirm('Delete discussion?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/discussions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setDiscussions((prev) => prev.filter((d) => d._id !== id));
        alert('✅ Discussion deleted');
      } else alert(data.msg || '❌ Delete failed');
    } catch (err) {
      console.error('❌ Error deleting discussion:', err);
    }
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm('Delete story?')) return;
    try {
      const res = await fetch(`${BASE_URL}/api/admin/stories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setStories((prev) => prev.filter((s) => s._id !== id));
        alert('✅ Story deleted');
      } else alert(data.msg || '❌ Delete failed');
    } catch (err) {
      console.error('❌ Error deleting story:', err);
    }
  };


 const fetchNews = async () => {
 // const token = localStorage.getItem('token');
   const token = localStorage.getItem('admin_token');

  const res = await fetch(`${BASE_URL}/api/admin/news`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  setNews(data);
};

const handleVerify = async (id, status) => {
  //const token = localStorage.getItem('token');
  const token = localStorage.getItem('admin_token');

  await fetch(`${BASE_URL}/api/admin/news/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  fetchNews();
};

const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this news item?')) return;
  //const token = localStorage.getItem('token');
  const token = localStorage.getItem('admin_token');

  await fetch(`${BASE_URL}/api/admin/news/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  fetchNews();
};



  const handleStoryVerify = async (id, status) => {
  await fetch(`${BASE_URL}/api/admin/stories/${id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  fetchData(); // refresh
};

const handleStoryDelete = async (id) => {
  if (confirm('Delete story?')) {
    await fetch(`${BASE_URL}/api/admin/stories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  }
};



  const handleResetPassword = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: resetEmail }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(`📧 Password reset link sent to ${resetEmail}`);
    } else {
      alert(data.msg || '❌ Failed to send reset email');
    }
  } catch (err) {
    console.error('Reset error:', err);
    alert('❌ Error sending reset email');
  }
};




//LOGOUT
  const logout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '', role: '' });
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

       


        
        <button className="btn" onClick={logout}>Logout</button>
      </div>

      {/* Incident Modals */}
      {selectedIncident && (
        <div className="modal">
          <div className="modal-content">
            <h3>📍 Incident Details</h3>
            <p><strong>Type:</strong> {selectedIncident.incidentType}</p>
            <p><strong>Status:</strong> {selectedIncident.status}</p>
            <p><strong>Urgency:</strong> {selectedIncident.urgency}</p>
            <p><strong>Description:</strong> {selectedIncident.description}</p>
            <button onClick={() => setSelectedIncident(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Discussion Modals */}
      {selectedDiscussion && (
        <div className="modal">
          <div className="modal-content">
            <h3>💬 Discussion Details</h3>
            <p><strong>Title:</strong> {selectedDiscussion.title}</p>
            <ul>{selectedDiscussion.messages?.map((m, i) => <li key={i}>{m.text}</li>)}</ul>
            <button onClick={() => setSelectedDiscussion(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Story Modals */}
      {selectedStory && (
        <div className="modal">
          <div className="modal-content">
            <h3>📚 Story Details</h3>
            <p><strong>Title:</strong> {selectedStory.title}</p>
            <p><strong>Content:</strong> {selectedStory.content}</p>
            <button onClick={() => setSelectedStory(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Incident Table */}
      <h3>📍 Incident Reports</h3>
      <table className="pretty-incident-table">
        <thead><tr><th>#</th><th>Type</th><th>Status</th><th>Urgency</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          {incidents.map((i, idx) => (
            <tr key={i._id} onClick={() => setSelectedIncident(i)}>
              <td>{idx + 1}</td>
              <td>{i.incidentType}</td>
              <td>
                {['pending', 'investigating', 'resolved', 'escalated'].map((s) => (
                  <button key={s} className={`status-btn ${s} ${i.status === s ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleStatusChange(i._id, s); }}>
                    {s}
                  </button>
                ))}
              </td>
              <td>{i.urgency}</td>
              <td>{new Date(i.date).toLocaleDateString()}</td>
              <td><button onClick={(e) => { e.stopPropagation(); handleDeleteIncident(i._id); }}>🗑️</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Discussions Table */}
      <h3>💬 Discussions</h3>
      <table className="pretty-incident-table">
        <thead><tr><th>#</th><th>Title</th><th>Messages</th><th>Date</th><th>Action</th></tr></thead>
        <tbody>
          {discussions.map((d, idx) => (
            <tr key={d._id} onClick={() => setSelectedDiscussion(d)}>
              <td>{idx + 1}</td>
              <td>{d.title}</td>
              <td>{d.messages?.length || 0}</td>
              <td>{new Date(d.createdAt).toLocaleDateString()}</td>
              <td><button onClick={(e) => { e.stopPropagation(); handleDeleteDiscussion(d._id); }}>🗑️</button></td>
            </tr>
          ))}
        </tbody>
      </table>



        {/* Story Table */}
      <h3>📖 Stories</h3>
<table className="pretty-incident-table">
  <thead>
    <tr><th>#</th><th>Title</th><th>Status</th><th>Date</th><th>Actions</th></tr>
  </thead>
  <tbody>
    {stories.map((story, idx) => (
      <tr key={story._id}>
        <td>{idx + 1}</td>
        <td>{story.title}</td>
        <td>{story.status}</td>
        <td>{new Date(story.createdAt).toLocaleDateString()}</td>
        <td>
          <button onClick={() => handleStoryVerify(story._id, 'verified')}>✅</button>
          <button onClick={() => handleStoryVerify(story._id, 'rejected')}>❌</button>
          <button onClick={() => handleStoryDelete(story._id)}>🗑️</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>


      {selectedStory && (
  <div className="modal">
    <div className="modal-content">
      <h3>{selectedStory.title}</h3>
      <p><strong>Author:</strong> {selectedStory.author || 'Anonymous'}</p>
      <p><strong>Location:</strong> {selectedStory.location}</p>
      <p><strong>Category:</strong> {selectedStory.category}</p>
      <p>{selectedStory.content}</p>
      {selectedStory.imageUrl && (
        <img src={selectedStory.imageUrl} alt="Story" style={{ maxWidth: '100%', marginTop: '1rem' }} />
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
      <button onClick={() => setSelectedStory(null)}>Close</button>
    </div>
  </div>
)}



      
{/* ✅ News Table */}
<h3>📰 News Management</h3>
<table className="pretty-incident-table">
  <thead>
    <tr><th>#</th><th>Title</th><th>Status</th><th>Date</th><th>Actions</th></tr>
  </thead>
  <tbody>
    {news.map((n, idx) => (
      <tr key={n._id} onClick={() => setSelectedNews(n)}>
        <td>{idx + 1}</td>
        <td>{n.title}</td>
        <td>{n.status}</td>
        <td>{new Date(n.createdAt).toLocaleDateString()}</td>
        <td>
          <button onClick={(e) => { e.stopPropagation(); handleVerify(n._id, 'verified'); }}>✅</button>
          <button onClick={(e) => { e.stopPropagation(); handleVerify(n._id, 'rejected'); }}>❌</button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}>🗑️</button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

{/* ✅ Modal for News Preview */}
{selectedNews && (
  <div className="modal">
    <div className="modal-content">
      <h3>{selectedNews.title}</h3>
      <p>{selectedNews.content}</p>
      {selectedNews.link && <a href={selectedNews.link} target="_blank">Read More</a>}
      {selectedNews.image && <img src={selectedNews.image} alt="news" style={{ maxWidth: '100%' }} />}
      <button onClick={() => setSelectedNews(null)}>Close</button>
    </div>
  </div>
)}



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
          <button className="btn" onClick={handleResetPassword}>
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
              placeholder="Password"
              type="password"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
            />
            <select
              name="role"
              value={registerData.role}
              onChange={handleRegisterChange}
              required
            >
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
            <button className="btn" type="submit">Register</button>
          </form>
          <p>
            Have an account?{" "}
            <span onClick={() => setShowRegister(false)}>Login</span>
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
              placeholder="Password"
              type="password"
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
              <option value="">Role</option>
              <option value="admin">Admin</option>
              <option value="super">Super Admin</option>
            </select>
            <button className="btn" type="submit">Login</button>
          </form>
          <p>
            <span onClick={() => setShowForgotPassword(true)}>Forgot Password?</span> |{" "}
            <span onClick={() => setShowRegister(true)}>Register</span>
          </p>
        </div>
      )
    ) : (
      <Dashboard />
    )}
  </div>
);



export default Admin;
