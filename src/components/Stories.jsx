import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHeart, FaShare, FaComment, FaUser } from 'react-icons/fa';
import './styles/stories.css';

// Backend API base URLs
const API_BASE_URL = 'https://backend-m6u3.onrender.com/api/stories';
const IMAGE_BASE_URL = 'https://backend-m6u3.onrender.com/uploads/';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [newStory, setNewStory] = useState({
    title: '',
    category: 'reconciliation',
    content: '',
    author: '',
    location: '',
    imageUrl: '',
    videoUrl: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStories = async () => {
    try {
      const res = await axios.get(API_BASE_URL);
      setStories(res.data.reverse());
    } catch (err) {
      console.error('❌ Failed to fetch stories:', err.message);
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
        location: '',
        imageUrl: '',
        videoUrl: ''
      });
      setShowForm(false);
      fetchStories();
    } catch (err) {
      console.error('❌ Error submitting story:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fix image URLs (if stored as relative filenames)
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return IMAGE_BASE_URL + url.replace(/^\/+/, '').replace(/^uploads[\\/]+/, '');
  };

  const filteredStories =
    activeCategory === 'all'
      ? stories
      : stories.filter((story) => story.category === activeCategory);

  return (
    <div className="page">
      <div className="container">
        <h2 className="page-title">Peace Stories</h2>
        <p className="page-subtitle">Real stories from the community</p>

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
            <input
              name="title"
              placeholder="Story Title *"
              value={newStory.title}
              onChange={handleInputChange}
              required
            />
            <textarea
              name="content"
              placeholder="Your Story *"
              value={newStory.content}
              onChange={handleInputChange}
              required
              rows="5"
            />
            <input
              name="imageUrl"
              placeholder="Image URL or Filename (optional)"
              value={newStory.imageUrl}
              onChange={handleInputChange}
            />
            <input
              name="videoUrl"
              placeholder="YouTube Video URL (optional)"
              value={newStory.videoUrl}
              onChange={handleInputChange}
            />
            <input
              name="author"
              placeholder="Your Name (optional)"
              value={newStory.author}
              onChange={handleInputChange}
            />
            <input
              name="location"
              placeholder="Location"
              value={newStory.location}
              onChange={handleInputChange}
            />
            <select
              name="category"
              value={newStory.category}
              onChange={handleInputChange}
            >
              <option value="reconciliation">Reconciliation</option>
              <option value="healing">Healing</option>
              <option value="community">Community</option>
            </select>
            <button type="submit" className="btn btn-submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Story'}
            </button>
          </form>
        )}

        <div className="stories-grid">
          {filteredStories.map((story) => {
            const fixedImageUrl = getImageUrl(story.imageUrl);
            return (
              <div key={story._id} className="story-card">
                <h3>{story.title}</h3>

                {fixedImageUrl && (
                  <>
                    <p style={{ fontSize: '12px', color: '#888' }}>
                      🔗 {fixedImageUrl}
                    </p>
                    <img
                      src={fixedImageUrl}
                      alt="Story Visual"
                      onError={(e) => {
                        e.target.src = '/default-image.jpg';
                        console.warn('❌ Image failed to load:', fixedImageUrl);
                      }}
                    />
                  </>
                )}

                {story.videoUrl && (
                  <iframe
                    width="100%"
                    height="250"
                    src={story.videoUrl.replace('watch?v=', 'embed/')}
                    frameBorder="0"
                    allowFullScreen
                  ></iframe>
                )}
                <p>{story.content}</p>
                <p>
                  <strong>{story.author || 'Anonymous'}</strong> — {story.location}
                </p>
                <p className="category">{story.category}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stories;
