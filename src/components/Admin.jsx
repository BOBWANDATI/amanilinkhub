import express from 'express';
import Incident from '../models/incident.js';
import {
  getAllReports,
  getMapData,
  deleteIncident
} from '../controllers/reportController.js';

const router = express.Router();

// ✅ GET: Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Incident.countDocuments();
    const pending = await Incident.countDocuments({ status: 'pending' });
    const resolved = await Incident.countDocuments({ status: 'resolved' });

    res.json({
      incidentsCount: total,
      pendingIncidents: pending,
      resolvedIncidents: resolved,
    });
  } catch (err) {
    console.error('❌ Error fetching stats:', err.message);
    res.status(500).json({ msg: '❌ Failed to load dashboard stats' });
  }
});

// ✅ GET: All incident reports
router.get('/report', getAllReports);

// ✅ GET: Incident map data (for map view)
router.get('/report/map', getMapData);

// ✅ PUT: Update incident status
router.put('/report/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'investigating', 'resolved', 'escalated'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: '❌ Invalid status value' });
    }

    const updatedIncident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedIncident) {
      return res.status(404).json({ msg: '❌ Incident not found' });
    }

    // 🔴 Emit update using Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('incident_updated', updatedIncident);
    }

    res.json({
      msg: `✅ Status updated to '${status}'`,
      incident: updatedIncident
    });
  } catch (err) {
    console.error('❌ Error updating incident status:', err.message);
    res.status(500).json({ msg: '❌ Server error' });
  }
});

// ✅ DELETE: Delete incident
router.delete('/report/:id', deleteIncident);

export default router;
