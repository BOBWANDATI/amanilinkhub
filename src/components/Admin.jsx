import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Admin.css';
import '../components/styles/SuperAdminDashboard.css';
import { io } from 'socket.io-client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const BASE_URL = 'https://backend-m6u3.onrender.com';
const socket = io(BASE_URL);

const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE'];

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
  const [analyticsData, setAnalyticsData] = useState({ line: [], pie: [], bar: [] });
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
    } else if (selectedCard === 'analytics') {
      fetch(`${BASE_URL}/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      })
        .then((res) => res.json())
        .then((data) => setAnalyticsData(data))
        .catch((err) => console.error('Failed to fetch analytics', err));
    }
  }, [selectedCard]);

  const AnalyticsDashboard = () => (
    <div className="super-admin-dashboard">
      <h2>📊 Analytics Dashboard</h2>
      <div className="chart-container">
        <h4>Incidents Over Time</h4>
        <LineChart width={600} height={300} data={analyticsData.line}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>

        <h4>Incident Status Distribution</h4>
        <PieChart width={400} height={300}>
          <Pie
            data={analyticsData.pie}
            cx={200}
            cy={150}
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {analyticsData.pie.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>

        <h4>Incidents by Location</h4>
        <BarChart width={600} height={300} data={analyticsData.bar}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="location" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </div>
      <button className="btn" onClick={() => setSelectedCard(null)}>← Back</button>
    </div>
  );

  const Dashboard = () => {
    const handleCardClick = (type) => setSelectedCard(type);
    const handleBack = () => setSelectedCard(null);

    if (selectedCard === 'analytics') return <AnalyticsDashboard />;

    // rest of your Dashboard component remains the same...

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
          <div className="dashboard-card" onClick={() => handleCardClick('analytics')}>
            <div className="card-icon">📊</div>
            <div className="card-title">Analytics</div>
            <div className="card-desc">📈 View Charts</div>
            <div className="card-value">📂</div>
          </div>
        </div>
        <button className="btn" onClick={logout}>Logout</button>
      </div>
    );
  };

  // ... rest of your Admin component stays the same ...
};
