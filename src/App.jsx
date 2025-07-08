import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Stats from './components/Stats';
import Features from './components/Features';
import Report from './components/Report';
import Map from './components/Map';
import Dialogue from './components/Dialogue';
import VerifiedNews from './components/VerifiedNews';
import Contact from './components/Contact';
import Admin from './components/Admin';
import Footer from './components/Footer';
import SuccessModal from './components/modals/SuccessModal';
import USSDModal from './components/modals/USSDModal';
import NewTopicModal from './components/modals/NewTopicModal';
import TestimonyModal from './components/modals/TestimonyModal';
import Donation from './components/Donation';
import Stories from './components/Stories';
import './App.css';
import SuperAdminDashboard from './components/SuperAdminDashboard';

function App() {
  const [showTestimonyModal, setShowTestimonyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUSSDModal, setShowUSSDModal] = useState(false);
  const [showNewTopicModal, setShowNewTopicModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Your submission has been received successfully.');

  const [mapData, setMapData] = useState({
    incidents: [
      { id: 1, type: 'theft', location: [1.2921, 36.8219], status: 'pending', date: '2023-05-15' },
      { id: 2, type: 'land', location: [0.3031, 36.0800], status: 'investigating', date: '2023-05-10' },
      { id: 3, type: 'water', location: [3.1181, 35.5978], status: 'resolved', date: '2023-04-28' },
    ],
    stats: {
      pending: 1,
      investigating: 1,
      resolved: 1,
      total: 3
    }
  });

  const [dialogueData, setDialogueData] = useState({
    topics: [
      { id: 1, title: "Land dispute in Nakuru County", category: "land", location: "Nakuru", participants: 12 },
      { id: 2, title: "Water access issues in Turkana", category: "water", location: "Turkana", participants: 8 },
      { id: 3, title: "Youth unemployment in Nairobi slums", category: "youth", location: "Nairobi", participants: 15 }
    ],
    messages: {}
  });

  const handleReportSubmit = (reportData) => {
    const newIncident = {
      id: mapData.incidents.length + 1,
      type: reportData.incidentType,
      location: reportData.location.split(',').map(Number),
      status: 'pending',
      date: reportData.date
    };

    setMapData(prev => ({
      incidents: [...prev.incidents, newIncident],
      stats: {
        ...prev.stats,
        pending: prev.stats.pending + 1,
        total: prev.stats.total + 1
      }
    }));

    setSuccessMessage('Your incident report has been submitted successfully.');
    setShowSuccessModal(true);
  };

  const handleNewTopic = (topicData) => {
    const newTopic = {
      id: dialogueData.topics.length + 1,
      title: topicData.title,
      category: topicData.category,
      location: topicData.location,
      participants: 1
    };

    setDialogueData(prev => ({
      ...prev,
      topics: [...prev.topics, newTopic],
      messages: {
        ...prev.messages,
        [newTopic.id]: [
          {
            id: 1,
            text: "Welcome to the discussion about " + topicData.title,
            sender: "Moderator",
            time: new Date().toLocaleTimeString()
          }
        ]
      }
    }));

    setSuccessMessage('Your new discussion topic has been created successfully.');
    setShowSuccessModal(true);
  };

  const handleTestimonySubmit = (testimonyData) => {
    setSuccessMessage('Thank you for sharing your peace story.');
    setShowSuccessModal(true);
  };

  const handleContactSubmit = (contactData) => {
    setSuccessMessage('Your message has been sent successfully. We will respond within 24 hours.');
    setShowSuccessModal(true);
  };

  return (
    <Router>
      <div className="app">
        <Navbar />

        <Routes>
          <Route path="/" element={
            <>
              <Home setShowTestimonyModal={setShowTestimonyModal} />
              <Stats />
              <Features setShowUSSDModal={setShowUSSDModal} />
            </>
          } />
          <Route path="/report" element={<Report onSubmit={handleReportSubmit} />} />
          <Route path="/map" element={<Map data={mapData} />} />
          <Route path="/dialogue" element={
            <Dialogue 
              data={dialogueData}
              setDialogueData={setDialogueData}
              setShowNewTopicModal={setShowNewTopicModal}
            />
          } />
          <Route path="/contact" element={<Contact onSubmit={handleContactSubmit} />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/donate" element={<Donation />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/news" element={<VerifiedNews />} />
          <Route path="/superadmin-dashboard" element={<SuperAdminDashboard />} />

        </Routes>

        <Footer />

        {/* Modals */}
        {showTestimonyModal && (
          <TestimonyModal 
            closeModal={() => setShowTestimonyModal(false)}
            onSubmit={handleTestimonySubmit}
          />
        )}
        {showSuccessModal && (
          <SuccessModal 
            message={successMessage}
            closeModal={() => setShowSuccessModal(false)}
          />
        )}
        {showUSSDModal && (
          <USSDModal closeModal={() => setShowUSSDModal(false)} />
        )}
        {showNewTopicModal && (
          <NewTopicModal 
            closeModal={() => setShowNewTopicModal(false)}
            onSubmit={handleNewTopic}
          />
        )}
      </div>
    </Router>
  );
}

export default App;
