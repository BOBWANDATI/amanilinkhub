import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/styles/Admin.css';
import '../components/styles/SuperAdminDashboard.css';
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
const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE'];

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [stats, setStats] = useState({});
  const [incidents, setIncidents] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({ line: [], pie: [], bar: [] });

  const navigate = useNavigate();

  // 👇 Fetch stats when logged in
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

  // 👇 Dynamically import and setup socket.io-client
  useEffect(() => {
    let socket;

    const setupSocket = async () => {
      const { io } = await import('socket.io-client');
      socket = io(BASE_URL);

      const handleNewIncident = (incident) => {
        setIncidents((prev) => [incident, ...prev]);
        alert(`🚨 New Incident: ${incident.title}`);
      };

      const handleIncidentUpdated = (updatedIncident) => {
        setIncidents((prev) =>
          prev.map((i) => (i._id === updatedIncident._id ? updatedIncident : i))
        );
      };

      socket.on('new_incident_reported', handleNewIncident);
      socket.on('incident_updated', handleIncidentUpdated);
    };

    if (selectedCard === 'incidents') {
      setupSocket();
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [selectedCard]);

  // 👇 Fetch card-specific data
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    if (selectedCard === 'incidents') {
      fetch(`${BASE_URL}/api/admin/report`, { headers })
        .then((res) => res.json())
        .then((data) => setIncidents(data))
        .catch((err) => console.error('Failed to fetch incidents', err));
    } else if (selectedCard === 'discussions') {
      fetch(`${BASE_URL}/api/discussions`, { headers })
        .then((res) => res.json())
        .then((data) => setDiscussions(data))
        .catch((err) => console.error('Failed to fetch discussions', err));
    } else if (selectedCard === 'analytics') {
      fetch(`${BASE_URL}/api/admin/analytics`, { headers })
        .then((res) => res.json())
        .then((data) => setAnalyticsData(data))
        .catch((err) => console.error('Failed to fetch analytics', err));
    }
  }, [selectedCard]);

  const logout = () => {
    localStorage.removeItem('admin_token');
    setIsLoggedIn(false);
    navigate('/');
  };

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
    if (selectedCard === 'analytics') return <AnalyticsDashboard />;

    return (
      <div className="super-admin-dashboard">
        <h2>🛡️ AmaniLink Hub Dashboard</h2>
        <div className="dashboard-cards">
          <div className="dashboard-card" onClick={() => setSelectedCard('incidents')}>
            <div className="card-icon">🔥</div>
            <div className="card-title">Incidents</div>
            <div className="card-desc">
              🔴 {stats.pendingIncidents || 0} Pending<br />
              ✅ {stats.resolvedIncidents || 0} Resolved
            </div>
            <div className="card-value">{stats.incidentsCount || 0} Total</div>
          </div>
          <div className="dashboard-card" onClick={() => setSelectedCard('discussions')}>
            <div className="card-icon">💬</div>
            <div className="card-title">Discussions</div>
            <div className="card-desc">📢 Total</div>
            <div className="card-value">{discussions.length}</div>
          </div>
          <div className="dashboard-card" onClick={() => setSelectedCard('analytics')}>
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

  return (
    <div>
      {isLoggedIn ? (
        <Dashboard />
      ) : (
        <div className="auth-message">
          <h3>🔐 Please log in as admin to view dashboard</h3>
        </div>
      )}
    </div>
  );
};

export default Admin;
