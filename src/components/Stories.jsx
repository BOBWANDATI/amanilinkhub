import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHeart, FaShare, FaComment, FaUser } from 'react-icons/fa';
import './styles/stories.css';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [newStory, setNewStory] = useState({
    title: '',
    category: 'reconciliation',
    content: '',
    author: '',
    location: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🌐 Render backend URL
  const API_BASE_URL = 'https://your-backend.onrender.com/api/stories';

  // 🔁 Fetch all verified stories
  const fetchStories = async () => {
    try {
      const res = await axios.get(API_BASE_URL);
      setStories(res.data.reverse()); // newest first
    } catch (error) {
      console.error('Error fetching stories:', error.message);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStory((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.post(API_BASE_URL, newStory);
      setNewStory({
        title: '',
        category: 'reconciliation',
        content: '',
        author: '',
        location: ''
      });
      setShowForm(false);
      fetchStories(); // Refresh
    } catch (err) {
      console.error('Error submitting story:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStories = activeCategory === 'all'
    ? stories
    : stories.filter(story => story.category === activeCategory);

  return (
    <div id="stories" className="page">
      <div className="container">
        <h2 className="page-title">Peace Stories</h2>
        <p className="page-subtitle">Read inspiring stories of reconciliation and healing from communities across Kenya</p>

        <div className="stories-actions">
          <div className="category-filter">
            {['all', 'reconciliation', 'healing', 'community'].map((cat) => (
              <button
                key={cat}
                className={activeCategory === cat ? 'active' : ''}
                onClick={() => setActiveCategory(cat)}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Share Your Story'}
          </button>
        </div>

        {showForm && (
          <form className="story-form" onSubmit={handleSubmit}>
            <h3>Share Your Peace Story</h3>

            <div className="form-group">
              <label htmlFor="title">Story Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newStory.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={newStory.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="reconciliation">Reconciliation</option>
                  <option value="healing">Healing & Recovery</option>
                  <option value="community">Community Building</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={newStory.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="content">Your Story *</label>
              <textarea
                id="content"
                name="content"
                value={newStory.content}
                onChange={handleInputChange}
                required
                rows="6"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="author">Your Name (optional)</label>
              <input
                type="text"
                id="author"
                name="author"
                value={newStory.author}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Story'}
              </button>
            </div>
          </form>
        )}

        <div className="stories-grid">
          {filteredStories.length > 0 ? (
            filteredStories.map((story) => (
              <div key={story._id} className="story-card">
                <div className="story-header">
                  <h3>{story.title}</h3>
                  <div className="story-meta">
                    <span><FaUser /> {story.author || 'Anonymous'}</span>
                    <span>{story.location}</span>
                    <span>{new Date(story.date).toLocaleDateString()}</span>
                  </div>
                  <div className="story-category">
                    {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                  </div>
                </div>

                <div className="story-content">
                  <p>{story.content}</p>
                </div>

                <div className="story-footer">
                  <button className="story-action"><FaHeart /> {story.likes}</button>
                  <button className="story-action"><FaComment /> {story.comments}</button>
                  <button className="story-action"><FaShare /> Share</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-stories">
              <p>No stories found in this category. Be the first to share!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stories;
