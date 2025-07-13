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
  const [selectedIncident, setSelectedIncident] = useState(null);
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
    const handleBack = () => {
      setSelectedCard(null);
      setSelectedIncident(null);
    };

    if (selectedCard === 'incidents') {
      if (selectedIncident) {
        return (
          <div className="super-admin-dashboard">
            <h2>📝 Incident Details</h2>
            <div className="incident-detail">
              <p><strong>ID:</strong> {selectedIncident._id}</p>
              <p><strong>Type:</strong> {selectedIncident.incidentType}</p>
              <p><strong>Status:</strong> {selectedIncident.status}</p>
              <p><strong>Urgency:</strong> {selectedIncident.urgency}</p>
              <p><strong>Reporter:</strong> {selectedIncident.anonymous ? 'Anonymous' : selectedIncident.reportedBy}</p>
              <p><strong>Date:</strong> {new Date(selectedIncident.date).toLocaleString()}</p>
              <p><strong>Description:</strong> {selectedIncident.description}</p>
              <p><strong>Location:</strong> {selectedIncident.locationName}</p>
              <p><strong>Coordinates:</strong> {selectedIncident.latitude}, {selectedIncident.longitude}</p>
            </div>
            <button className="btn" onClick={() => setSelectedIncident(null)}>← Back to List</button>
          </div>
        );
      }

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
                <tr key={incident._id} onClick={() => setSelectedIncident(incident)}>
                  <td>{i + 1}</td>
                  <td>{incident._id.slice(0, 6)}...</td>
                  <td>{incident.incidentType || 'N/A'}</td>
                  <td>{['pending','investigating','resolved','escalated'].map((status) => (
                    <button key={status} className={`status-btn ${status} ${incident.status === status ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); handleStatusChange(incident._id, status); }}>{status}</button>
                  ))}</td>
                  <td>{incident.urgency || 'Normal'}</td>
                  <td>{incident.anonymous ? 'Anonymous' : incident.reportedBy || 'User'}</td>
                  <td>{new Date(incident.date).toLocaleDateString()}</td>
                  <td><button className="btn btn-delete" onClick={(e) => { e.stopPropagation(); handleDeleteIncident(incident._id); }}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn" onClick={handleBack}>← Back</button>
        </div>
      );
    }

    // (Discussions view remains unchanged...)
    // (Other parts of the component remain unchanged...)
  };

  // (The rest of the component code remains unchanged)

  return (
    <div className="admin-container">
      {!isLoggedIn ? (
        // (Login/Register UI remains unchanged...)
      ) : <Dashboard />}
    </div>
  );
};

export default Admin;
