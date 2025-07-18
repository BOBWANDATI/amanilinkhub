import { useState, useEffect } from 'react';
import '../components/styles/VerifiedNews.css';

const BASE_URL = import.meta.env.VITE_SOCKET_URL;
const isAdmin = false; // Set to true if the current user is an admin (this can be dynamic)

const VerifiedNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    image: '',
    link: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/news`);
        const data = await res.json();
        const verifiedNews = data.filter((n) => n.status === 'verified'); // Only show verified news
        setNewsList(verifiedNews);
      } catch (err) {
        console.error('❌ Error fetching news:', err);
      }
    };

    fetchNews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { title, content, image, link } = newArticle;

    if (!title.trim() || !content.trim() || !link.trim()) {
      setError('⚠️ Title, Description, and Link are required.');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/news`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          image: image || 'https://via.placeholder.com/400x200',
          link,
          status: 'pending', // 🟡 Mark as pending until admin approves
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit news.');
      }

      setNewArticle({ title: '', content: '', image: '', link: '' });
      setSuccess('✅ News submitted successfully! Awaiting admin verification.');
    } catch (err) {
      console.error('❌ News post error:', err);
      setError('❌ Failed to submit news. Try again later.');
    }
  };

  return (
    <div className="verified-news-container">
      <h2 className="news-title">📰 Verified Peace News</h2>

      {!isAdmin && (
        <form className="news-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="News Title *"
            value={newArticle.title}
            onChange={(e) =>
              setNewArticle({ ...newArticle, title: e.target.value })
            }
            required
          />
          <textarea
            placeholder="News Description *"
            value={newArticle.content}
            onChange={(e) =>
              setNewArticle({ ...newArticle, content: e.target.value })
            }
            required
          />
          <input
            type="url"
            placeholder="Image URL (optional)"
            value={newArticle.image}
            onChange={(e) =>
              setNewArticle({ ...newArticle, image: e.target.value })
            }
          />
          <input
            type="url"
            placeholder="External Link *"
            value={newArticle.link}
            onChange={(e) =>
              setNewArticle({ ...newArticle, link: e.target.value })
            }
            required
          />
          <button type="submit" className="btn btn-primary">
            Submit News
          </button>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </form>
      )}

      <div className="news-list">
        {newsList.length > 0 ? (
          newsList.map((news) => (
            <a
              key={news._id}
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="news-item clickable"
            >
              <img
                src={news.image || 'https://via.placeholder.com/400x200'}
                alt={news.title}
                className="news-image"
              />
              <h3>{news.title}</h3>
              <p>{news.content.substring(0, 100)}...</p>
              <span className="verified-label">✔ Verified</span>
            </a>
          ))
        ) : (
          <p>No verified news available yet.</p>
        )}
      </div>
    </div>
  );
};

export default VerifiedNews;
