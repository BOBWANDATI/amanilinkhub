import { useState, useEffect } from 'react';
import { FaComments, FaPlus, FaPaperPlane, FaRobot } from 'react-icons/fa';
import { io } from 'socket.io-client';
import '../components/styles/Dialogue.css';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ['websocket'], // force websocket
  withCredentials: true
});

const BASE_URL = import.meta.env.VITE_SOCKET_URL;

const Dialogue = () => {
  const [activeTopic, setActiveTopic] = useState(null);
  const [message, setMessage] = useState('');
  const [topics, setTopics] = useState([]);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    location: '',
    category: 'general'
  });

  // Fetch topics
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/discussions`);
        const data = await res.json();

        const aiBot = {
          _id: 'ai-peacebot',
          title: 'Ask PeaceBot (AI)',
          category: 'ai',
          location: 'Virtual',
          participants: 1
        };

        setTopics([...data, aiBot]);
      } catch (error) {
        console.error('Failed to fetch discussions:', error);
      }
    };

    fetchDiscussions();
  }, []);

  // Listen to messages via socket
  useEffect(() => {
    socket.on('message', ({ topicId, message }) => {
      setMessages(prev => ({
        ...prev,
        [topicId]: [...(prev[topicId] || []), message]
      }));
    });

    return () => {
      socket.off('message');
    };
  }, []);

  const handleSendMessage = async (topicId) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'You',
      time: new Date().toLocaleTimeString()
    };

    // Save in local state
    setMessages(prev => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), userMessage]
    }));

    // Emit to server (real-time)
    if (topicId !== 'ai-peacebot') {
      socket.emit('message', { topicId, message: userMessage });
    }

    setMessage('');

    if (topicId === 'ai-peacebot') {
      setLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/ai/peacebot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: userMessage.text })
        });

        const data = await response.json();

        const aiReply = {
          id: Date.now() + 1,
          text: data.text || '🤖 PeaceBot has no answer right now.',
          sender: 'PeaceBot',
          time: new Date().toLocaleTimeString()
        };

        setMessages(prev => ({
          ...prev,
          [topicId]: [...(prev[topicId] || []), aiReply]
        }));
      } catch (error) {
        const failMsg = {
          id: Date.now() + 2,
          text: '⚠️ AI service is currently unavailable.',
          sender: 'PeaceBot',
          time: new Date().toLocaleTimeString()
        };
        setMessages(prev => ({
          ...prev,
          [topicId]: [...(prev[topicId] || []), failMsg]
        }));
      } finally {
        setLoading(false);
      }
    }
  };

  const selectTopic = (topic) => {
    setActiveTopic(topic);
    if (!messages[topic._id]) {
      const welcomeText = topic._id === 'ai-peacebot'
        ? "🤖 Welcome! I'm AmaniLinkBot. Ask any question about conflict resolution, peacebuilding, or mediation."
        : `Welcome to the discussion about "${topic.title}"`;

      setMessages(prev => ({
        ...prev,
        [topic._id]: [{
          id: 1,
          text: welcomeText,
          sender: topic._id === 'ai-peacebot' ? 'PeaceBot' : 'Moderator',
          time: new Date().toLocaleTimeString()
        }]
      }));
    }
  };

  const handleCreateDiscussion = async () => {
    const { title, location, category } = newDiscussion;
    if (!title.trim() || !location.trim()) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/discussions/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          location,
          category,
          message: `New discussion started: ${title}`,
          sender: 'Moderator'
        })
      });

      const data = await response.json();

      const updatedTopics = [
        ...topics.filter(t => t._id !== 'ai-peacebot'),
        data,
        topics.find(t => t._id === 'ai-peacebot')
      ];

      setTopics(updatedTopics);
      setShowForm(false);
      setNewDiscussion({ title: '', location: '', category: 'general' });
      selectTopic(data);
    } catch (error) {
      console.error('Error creating discussion:', error);
      alert('Failed to create discussion.');
    }
  };

  return (
    <div id="dialogue" className="page">
      <div className="container">
        <h2 className="page-title">Community Dialogue Platform</h2>
        <p className="page-subtitle">Join discussions or ask PeaceBot to resolve conflict-related questions</p>

        <div className="dialogue-container">
          <div className="dialogue-sidebar">
            <div className="dialogue-card">
              <div className="dialogue-card-header">
                <h3><FaComments /> Active Discussions</h3>
                <p>Tap any topic to join or ask PeaceBot directly</p>
              </div>

              <div className="dialogue-card-content">
                <div className="topics-list">
                  {topics.map(topic => (
                    <div
                      key={topic._id}
                      className={`topic-item ${activeTopic?._id === topic._id ? 'active' : ''}`}
                      onClick={() => selectTopic(topic)}
                    >
                      <h4>{topic.title}</h4>
                      <p>{topic.location} • {topic.participants || 1} participants</p>
                    </div>
                  ))}
                </div>

                {showForm ? (
                  <div className="new-topic-form">
                    <input
                      type="text"
                      placeholder="Discussion Title"
                      value={newDiscussion.title}
                      onChange={e => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Location"
                      value={newDiscussion.location}
                      onChange={e => setNewDiscussion({ ...newDiscussion, location: e.target.value })}
                    />
                    <select
                      value={newDiscussion.category}
                      onChange={e => setNewDiscussion({ ...newDiscussion, category: e.target.value })}
                    >
                      <option value="general">General</option>
                      <option value="land">Land</option>
                      <option value="water">Water</option>
                      <option value="youth">Youth</option>
                      <option value="conflict">Conflict</option>
                    </select>
                    <button className="btn btn-primary" onClick={handleCreateDiscussion}>
                      Start Discussion
                    </button>
                  </div>
                ) : (
                  <>
                    <button className="btn btn-secondary dialogue-new-btn" onClick={() => setShowForm(true)}>
                      <FaPlus /> Start New Discussion
                    </button>
                    <button
                      className="btn btn-secondary dialogue-peacebot-btn pop"
                      onClick={() => selectTopic(topics.find(t => t._id === 'ai-peacebot'))}
                    >
                      <FaRobot /> Ask PeaceBot
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="dialogue-main">
            {!activeTopic ? (
              <div className="dialogue-empty">
                <FaComments />
                <h3>Select a Topic</h3>
                <p>Choose a discussion or ask PeaceBot</p>
              </div>
            ) : (
              <div className="dialogue-chat">
                <div className="chat-header">
                  <h3>{activeTopic.title}</h3>
                  <p>{activeTopic.participants || 1} participants • {activeTopic._id === 'ai-peacebot' ? 'AI PeaceBot Chat' : 'Community Discussion'}</p>
                </div>

                <div className="chat-messages">
                  {messages[activeTopic._id]?.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender === 'PeaceBot' ? 'peacebot-message' : ''}`}>
                      <strong>{msg.sender}:</strong> {msg.text}
                      <span className="message-time">{msg.time}</span>
                    </div>
                  ))}
                  {loading && activeTopic._id === 'ai-peacebot' && (
                    <div className="message"><FaRobot /> PeaceBot is thinking...</div>
                  )}
                </div>

                <div className="chat-input">
                  <input
                    type="text"
                    placeholder={activeTopic._id === 'ai-peacebot' ? 'Ask your question to PeaceBot...' : 'Share your thoughts...'}
                    value={message}
                    maxLength="500"
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <span className="character-count">{message.length}/500</span>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSendMessage(activeTopic._id)}
                    disabled={loading}
                  >
                    <FaPaperPlane />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dialogue;
