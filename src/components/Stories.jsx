import { useState, useEffect } from 'react';
import { FaHeart, FaShare, FaComment, FaUser } from 'react-icons/fa';
import './styles/Stories.css';

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

  // Sample data - in a real app, you would fetch this from an API
  useEffect(() => {
    const sampleStories = [
      {
        id: 1,
        title: "From Conflict to Harmony in Kibera",
        category: "reconciliation",
        content: "After years of ethnic tensions in our neighborhood, we came together through community dialogues facilitated by Peace Hub. Today, we celebrate our diversity as strength.",
        author: "Jane Muthoni",
        location: "Nairobi, Kenya",
        date: "2023-05-15",
        likes: 24,
        comments: 8
      },
      {
        id: 2,
        title: "Water Brings Us Together",
        category: "community",
        content: "The water crisis in our village used to cause daily fights. Now we have a fair distribution system and peace committees to resolve any issues that arise.",
        author: "Mohamed Abdi",
        location: "Garissa, Kenya",
        date: "2023-04-28",
        likes: 42,
        comments: 15
      },
      {
        id: 3,
        title: "Healing After the Elections",
        category: "healing",
        content: "The 2022 elections left our community divided. Through trauma healing circles, we've been able to forgive and rebuild relationships with our neighbors.",
        author: "",
        location: "Nakuru, Kenya",
        date: "2023-03-10",
        likes: 37,
        comments: 12
      }
    ];
    setStories(sampleStories);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStory({
      ...newStory,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submittedStory = {
      ...newStory,
      id: stories.length + 1,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: 0
    };
    setStories([submittedStory, ...stories]);
    setNewStory({
      title: '',
      category: 'reconciliation',
      content: '',
      author: '',
      location: ''
    });
    setShowForm(false);
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
            <button 
              className={activeCategory === 'all' ? 'active' : ''}
              onClick={() => setActiveCategory('all')}
            >
              All Stories
            </button>
            <button 
              className={activeCategory === 'reconciliation' ? 'active' : ''}
              onClick={() => setActiveCategory('reconciliation')}
            >
              Reconciliation
            </button>
            <button 
              className={activeCategory === 'healing' ? 'active' : ''}
              onClick={() => setActiveCategory('healing')}
            >
              Healing
            </button>
            <button 
              className={activeCategory === 'community' ? 'active' : ''}
              onClick={() => setActiveCategory('community')}
            >
              Community
            </button>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
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
                placeholder="Give your story a title"
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
                  placeholder="City, County"
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
                placeholder="Tell your story of peace, reconciliation, or healing..."
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
                placeholder="Leave blank to remain anonymous"
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Submit Story
              </button>
            </div>
          </form>
        )}

        <div className="stories-grid">
          {filteredStories.length > 0 ? (
            filteredStories.map(story => (
              <div key={story.id} className="story-card">
                <div className="story-header">
                  <h3>{story.title}</h3>
                  <div className="story-meta">
                    {story.author ? (
                      <span><FaUser /> {story.author}</span>
                    ) : (
                      <span><FaUser /> Anonymous</span>
                    )}
                    <span>{story.location}</span>
                    <span>{story.date}</span>
                  </div>
                  <div className="story-category">
                    {story.category.charAt(0).toUpperCase() + story.category.slice(1)}
                  </div>
                </div>
                
                <div className="story-content">
                  <p>{story.content}</p>
                </div>
                
                <div className="story-footer">
                  <button className="story-action">
                    <FaHeart /> {story.likes}
                  </button>
                  <button className="story-action">
                    <FaComment /> {story.comments}
                  </button>
                  <button className="story-action">
                    <FaShare /> Share
                  </button>
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
