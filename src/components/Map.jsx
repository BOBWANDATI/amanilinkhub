import { useEffect, useRef, useState } from 'react';
import { FaSyncAlt } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../components/styles/Map.css';

// ✅ Use deployed backend (Render)
const API_URL = 'https://backend-m6u3.onrender.com';
const socket = io(API_URL);

const statusColors = {
  pending: 'red',
  investigating: 'orange',
  resolved: 'green',
  escalated: 'brown',
};

const Map = () => {
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const navigate = useNavigate();
  const [mapData, setMapData] = useState({ incidents: [], stats: {} });

  const fetchMapData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/report/map`);
      const data = await res.json();
      setMapData(data);
    } catch (err) {
      console.error('❌ Failed to fetch map data:', err);
    }
  };

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map('mapDisplay').setView([1.2921, 36.8219], 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const renderMarkers = () => {
    const map = mapRef.current;
    if (!map || !mapData?.incidents) return;

    if (markerLayerRef.current) {
      markerLayerRef.current.clearLayers();
    }

    const markerCluster = L.markerClusterGroup({
      iconCreateFunction: (cluster) => {
        const markers = cluster.getAllChildMarkers();
        const statusCount = {
          pending: 0,
          investigating: 0,
          resolved: 0,
          escalated: 0,
        };

        markers.forEach(marker => {
          const status = marker.options.status || 'pending';
          statusCount[status] = (statusCount[status] || 0) + 1;
        });

        const dominantStatus = Object.entries(statusCount).sort((a, b) => b[1] - a[1])[0][0];
        const dominantColor = statusColors[dominantStatus] || 'gray';

        return L.divIcon({
          html: `<div style="background-color:${dominantColor}; color:white; border-radius:50%; padding:8px 12px; font-size:12px">${cluster.getChildCount()}</div>`,
          className: 'custom-cluster-icon',
          iconSize: [30, 30]
        });
      }
    });

    mapData.incidents.forEach(({ id, location, type, status, date }) => {
      const lat = location?.lat;
      const lng = location?.lng;

      if (lat && lng) {
        const marker = L.circleMarker([lat, lng], {
          radius: 8,
          color: statusColors[status] || 'gray',
          fillColor: statusColors[status] || 'gray',
          fillOpacity: 0.8,
          status: status
        }).bindPopup(`
          <strong>Type:</strong> ${type}<br/>
          <strong>Status:</strong> <span style="color:${statusColors[status]}">${status}</span><br/>
          <strong>Date:</strong> ${new Date(date).toLocaleString()}
        `);

        markerCluster.addLayer(marker);
      }
    });

    markerCluster.addTo(map);
    markerLayerRef.current = markerCluster;

    if (markerCluster.getLayers().length > 0) {
      map.fitBounds(markerCluster.getBounds(), { padding: [50, 50] });
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  useEffect(() => {
    renderMarkers();
  }, [mapData]);

  useEffect(() => {
    const handleDeleted = ({ id }) => {
      setMapData(prev => ({
        ...prev,
        incidents: prev.incidents.filter(i => i.id !== id)
      }));
    };

    const handleUpdated = (updatedIncident) => {
      setMapData(prev => ({
        ...prev,
        incidents: prev.incidents.map(i =>
          i.id === updatedIncident.id ? updatedIncident : i
        )
      }));
    };

    const handleNewIncident = () => {
      fetchMapData();
    };

    socket.on('incident_deleted', handleDeleted);
    socket.on('incident_updated', handleUpdated);
    socket.on('new_incident_reported', handleNewIncident);

    return () => {
      socket.off('incident_deleted', handleDeleted);
      socket.off('incident_updated', handleUpdated);
      socket.off('new_incident_reported', handleNewIncident);
    };
  }, []);

  return (
    <div id="map" className="page">
      <div className="container">
        <h2 className="page-title">Conflict Map</h2>
        <button onClick={() => navigate('/')} className="btn btn-secondary">Go To Home</button>
        <p className="page-subtitle">Interactive map showing reported incidents and their status</p>

        <div className="map-container">
          <div className="map-controls">
            <select id="statusFilter">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
            </select>
            <select id="typeFilter">
              <option value="all">All Types</option>
              <option value="theft">Theft</option>
              <option value="fight">Fight</option>
              <option value="shooting">Shooting</option>
              <option value="cattle">Cattle Theft</option>
              <option value="land">Land Dispute</option>
              <option value="water">Water Conflict</option>
            </select>
            <select id="timeFilter">
              <option value="all">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button className="btn-secondary" onClick={fetchMapData}><FaSyncAlt /> Refresh</button>
          </div>

          <div id="mapDisplay" className="map-display"></div>

          <div className="map-legend">
            <h4>Legend</h4>
            <div className="legend-item"><span className="legend-color red"></span> Pending</div>
            <div className="legend-item"><span className="legend-color orange"></span> Investigating</div>
            <div className="legend-item"><span className="legend-color green"></span> Resolved</div>
            <div className="legend-item"><span className="legend-color brown"></span> Escalated</div>
          </div>

          <div className="map-stats">
            <div className="stat-item"><strong>{mapData.stats?.pending || 0}</strong><span>Pending</span></div>
            <div className="stat-item"><strong>{mapData.stats?.resolved || 0}</strong><span>Resolved</span></div>
            <div className="stat-item"><strong>{mapData.stats?.total || 0}</strong><span>Total</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
