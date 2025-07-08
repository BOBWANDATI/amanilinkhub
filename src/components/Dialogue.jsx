import { useState, useEffect } from 'react';
import { FaComments, FaPlus, FaPaperPlane, FaRobot } from 'react-icons/fa';
import '../components/styles/Dialogue.css';

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

  const fetchDiscussions = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/discussions');
      const data = await res.json();

      const aiBot = {
        id: 'ai-peacebot',
        title: "Ask PeaceBot (AI)",
        category: "ai",
        location: "Virtual",
        participants: 1
      };

      setTopics([...data, aiBot]);
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const handleSendMessage = async (topicId) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: "You",
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => ({
      ...prev,
      [topicId]: [...(prev[topicId] || []), userMessage]
    }));

    setMessage('');

    if (topicId === 'ai-peacebot') {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/ai/peacebot', {
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
      } catch {
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
    if (!messages[topic.id]) {
      const welcomeText = topic.id === 'ai-peacebot'
        ? "🤖 Welcome! I'm AmaniLinkBot. Ask any question about conflict resolution, peacebuilding, or mediation."
        : "Welcome to the discussion about " + topic.title;

      setMessages(prev => ({
        ...prev,
        [topic.id]: [
          {
            id: 1,
            text: welcomeText,
            sender: topic.id === 'ai-peacebot' ? "PeaceBot" : "Moderator",
            time: new Date().toLocaleTimeString()
          }
        ]
      }));
    }
  };

  const handleCreateDiscussion = async () => {
    const { title, location, category } = newDiscussion;
    if (!title || !location) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/discussions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          location,
          category,
          message: `New discussion started: ${title}`,
          sender: "Moderator"
        })
      });

      const data = await response.json();

      const updatedTopics = [...topics.filter(t => t.id !== 'ai-peacebot'), data, topics.find(t => t.id === 'ai-peacebot')];
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
          {/* Sidebar */}
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
                      key={topic.id}
                      className={`topic-item ${activeTopic?.id === topic.id ? 'active' : ''}`}
                      onClick={() => selectTopic(topic)}
                    >
                      <h4>{topic.title}</h4>
                      <p>{topic.location} • {topic.participants} participants</p>
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
                      onClick={() => selectTopic(topics.find(t => t.id === 'ai-peacebot'))}
                    >
                      <FaRobot /> Ask PeaceBot
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
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
                  <p>{activeTopic.participants} participants • {activeTopic.id === 'ai-peacebot' ? 'AI PeaceBot Chat' : 'Community Discussion'}</p>
                </div>

                <div className="chat-messages">
                  {messages[activeTopic.id]?.map(msg => (
                    <div key={msg.id} className={`message ${msg.sender === 'PeaceBot' ? 'peacebot-message' : ''}`}>
                      <strong>{msg.sender}:</strong> {msg.text}
                      <span className="message-time">{msg.time}</span>
                    </div>
                  ))}
                  {loading && activeTopic.id === 'ai-peacebot' && <div className="message"><FaRobot /> PeaceBot is thinking...</div>}
                </div>

                <div className="chat-input">
                  <input
                    type="text"
                    placeholder={activeTopic.id === 'ai-peacebot' ? 'Ask your question to PeaceBot...' : 'Share your thoughts...'}
                    value={message}
                    maxLength="500"
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <span className="character-count">{message.length}/500</span>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleSendMessage(activeTopic.id)}
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
