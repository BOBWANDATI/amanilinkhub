import React, { useEffect, useState } from 'react';
import '../components/styles/SuperAdminDashboard.css';

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Fetch dashboard stats (replace with your actual endpoint)
    fetch('http://localhost:5051/api/admin/stats', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin_token')}`
      }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Failed to fetch dashboard stats', err));
  }, []);

  return (
    <div className="super-admin-dashboard">
      <h2>🛡️ Super Admin Dashboard</h2>
      <div className="dashboard-cards">

        <div className="dashboard-card">
          <div className="card-icon">📝</div>
          <div className="card-title">Reports</div>
          <div className="card-desc">Submitted reports (pending, resolved)</div>
          <div className="card-value">{stats.reportsCount || 0}</div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📰</div>
          <div className="card-title">News</div>
          <div className="card-desc">View or delete news posts</div>
          <div className="card-value">{stats.newsCount || 0}</div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🔥</div>
          <div className="card-title">Incidents</div>
          <div className="card-desc">Total incidents, pending, resolved</div>
          <div className="card-value">{stats.incidentsCount || 0}</div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">💬</div>
          <div className="card-title">Dialogues</div>
          <div className="card-desc">Active community discussions</div>
          <div className="card-value">{stats.dialoguesCount || 0}</div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📩</div>
          <div className="card-title">Messages</div>
          <div className="card-desc">Messages under all dialogues</div>
          <div className="card-value">{stats.messagesCount || 0}</div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📖</div>
          <div className="card-title">Stories</div>
          <div className="card-desc">User-submitted conflict stories</div>
          <div className="card-value">{stats.storiesCount || 0}</div>
        </div>

      </div>
    </div>
  );
};

export default SuperAdminDashboard;
