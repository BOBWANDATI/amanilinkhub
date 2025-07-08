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
  const socket = useRef(null); // FIX: useRef to persist socket
  const navigate = useNavigate();

  // Init socket on mount (once)
  useEffect(() => {
    socket.current = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket'],
    });

    return () => {
      socket.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn && loginData.role === 'super') {
      fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
      })
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error('Failed to fetch dashboard stats', err));
    }
  }, [isLoggedIn, loginData.role]);

  useEffect(() => {
    if (!socket.current) return;

    const handleNewIncident = (incident) => {
      if (loginData.role === 'super' && selectedCard === 'incidents') {
        setIncidents(prev => [incident, ...prev]);
        alert(`🚨 New Incident: ${incident.title}`);
      }
    };

    const handleIncidentUpdated = (updatedIncident) => {
      setIncidents(prev =>
        prev.map(i => (i._id === updatedIncident._id ? updatedIncident : i))
      );
    };

    socket.current.on("new_incident_reported", handleNewIncident);
    socket.current.on("incident_updated", handleIncidentUpdated);

    return () => {
      socket.current.off("new_incident_reported", handleNewIncident);
      socket.current.off("incident_updated", handleIncidentUpdated);
    };
  }, [loginData.role, selectedCard]);

  // rest of your code is unchanged...
