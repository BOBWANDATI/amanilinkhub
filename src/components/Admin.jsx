import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Admin.css';
import '../components/styles/SuperAdminDashboard.css';
import { io } from 'socket.io-client';

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

  const BACKEND_URL = 'https://backend-m6u3.onrender.com';
  const socket = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    socket.current = io(import.meta.env.VITE_SOCKET_URL || BACKEND_URL, {
      transports: ['websocket'],
    });
    return () => socket.current?.disconnect();
  }, []);

  useEffect(() => {
    if (isLoggedIn && loginData.role === 'super') {
      fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      })
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Failed to fetch dashboard stats', err));

      fetch(`${BACKEND_URL}/api/report`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      })
        .then(res => res.json())
        .then(data => setIncidents(data))
        .catch(err => console.error('Failed to fetch incidents', err));
    }
  }, [isLoggedIn, loginData.role]);

  useEffect(() => {
    if (!socket.current) return;

    const handleNewIncident = (incident) => {
      if (loginData.role === 'super' && selectedCard === 'incidents') {
        setIncidents(prev => [incident, ...prev]);
        alert(`🚨 New Incident Reported`);
      }
    };

    const handleIncidentUpdated = (updatedIncident) => {
      setIncidents(prev => prev.map(i => (i._id === updatedIncident._id ? updatedIncident : i)));
    };

    socket.current.on("new_incident_reported", handleNewIncident);
    socket.current.on("incident_updated", handleIncidentUpdated);

    return () => {
      socket.current.off("new_incident_reported", handleNewIncident);
      socket.current.off("incident_updated", handleIncidentUpdated);
    };
  }, [loginData.role, selectedCard]);

  const updateStatus = async (incidentId, newStatus) => {
  try {
    const token = localStorage.getItem('admin_token');
    const response = await fetch(`${BACKEND_URL}/api/report/${incidentId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await response.json();
    if (response.ok) {
      alert('✅ Status updated');
      setIncidents(prev =>
        prev.map(i => i._id === incidentId ? { ...i, status: newStatus } : i)
      );
    } else {
      alert(`❌ Failed: ${data.msg}`);
    }
  } catch (err) {
    console.error('❌ Error updating status:', err);
    alert('Error updating status');
  }
};


  return (
    <div className="admin-dashboard">
      {isLoggedIn && loginData.role === 'super' && selectedCard === 'incidents' && (
        <div className="incident-list">
          <h2>Incident Reports</h2>
          {incidents.map((incident) => (
            <div key={incident._id} className="incident-card">
              <p><strong>Type:</strong> {incident.type}</p>
              <p><strong>Status:</strong> {incident.status}</p>
              <p><strong>Date:</strong> {new Date(incident.date).toLocaleString()}</p>
              <p><strong>Location:</strong> Lat {incident.location?.lat}, Lng {incident.location?.lng}</p>
              <select
                value={incident.status}
                onChange={(e) => updateStatus(incident._id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;
