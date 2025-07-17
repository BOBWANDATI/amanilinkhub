// src/pages/Stories.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaHeart, FaShare, FaComment, FaUser } from 'react-icons/fa';
import '../components/styles/stories.css';

const API_BASE_URL = 'https://backend-m6u3.onrender.com/api/stories';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [newStory, setNewStory] = useState({
    title: '',
    category: 'reconciliation',
    content: '',
    author: '',
    location: '',
    videoLink: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await axios.get(API_BASE_URL);
      setStories(res.data.reverse());
    } catch (err) {
      console.error('Failed to fetch stories:', err.message);
    }
  };

  const handleLike = async (id) => {
    try {
      await axios.patch(${API_BASE_URL}/${id}/like);
      fetchStories();
    } catch (err) {
      console.error('Error liking story:', err);
    }
  };

  const handleShare = (story) => {
    const url = ${window.location.origin}/stories/${story._id};
    navigator.clipboard.writeText(${story.title} - Read more: ${url});
    alert('📋 Story link copied to clipboard!');
  };

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
        location: '',
        videoLink: ''
      });
      setShowForm(false);
      fetchStories();
    } catch (err) {
      console.error('Error submitting story:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStories =
    activeCategory === 'all'
      ? stories
      : stories.filter((story) => story.category === activeCategory);

  return (
    <div className="page" id="stories">
      <div className="container">
        <h2 className="page-title">Peace Stories</h2>
        <p className="page-subtitle">Read inspiring stories of reconciliation, healing, and unity.</p>

        {/* Category Filters */}
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

        {/* Share Story Form */}
        {showForm && (
          <form className="story-form" onSubmit={handleSubmit}>
            <h3>Submit Your Peace Story</h3>
            <input type="text" name="title" value={newStory.title} onChange={handleInputChange} placeholder="Story Title" required />
            <select name="category" value={newStory.category} onChange={handleInputChange} required>
              <option value="reconciliation">Reconciliation</option>
              <option value="healing">Healing & Recovery</option>
              <option value="community">Community Building</option>
            </select>
            <input type="text" name="location" value={newStory.location} onChange={handleInputChange} placeholder="Location" />
            <input type="url" name="videoLink" value={newStory.videoLink} onChange={handleInputChange} placeholder="Video Link (optional)" />
            <textarea name="content" rows="6" value={newStory.content} onChange={handleInputChange} placeholder="Your Story" required />
            <input type="text" name="author" value={newStory.author} onChange={handleInputChange} placeholder="Your Name (optional)" />
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}

        {/* Stories */}
        <div className="stories-grid">
          {filteredStories.length > 0 ? (
            filteredStories.map((story) => (
              <div key={story._id} className="story-card">
                <div className="story-header">
                  <Link to={/stories/${story._id}} className="story-title-link">
                    <h3>{story.title}</h3>
                  </Link>
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
                  <p>{story.content.length > 180 ? story.content.substring(0, 180) + '...' : story.content}</p>
                  {story.videoLink && <p className="story-video-link">🎥 <em>Video included</em></p>}
                </div>
                <div className="story-footer">
                  <button onClick={() => handleLike(story._id)}><FaHeart /> {story.likes || 0}</button>
                  <button><FaComment /> {story.comments || 0}</button>
                  <button onClick={() => handleShare(story)}><FaShare /> Share</button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-stories">No stories found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stories;
