import { useState, useEffect } from 'react';
import '../components/styles/VerifiedNews.css';

const isAdmin = true; // Simulate admin access

const VerifiedNews = () => {
  const [newsList, setNewsList] = useState([]);
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    image: '',
    link: '',
  });

  // Simulated initial news data
  useEffect(() => {
    const sampleNews = [
      {
        id: 1,
        title: 'Peace Deal Signed in Tana River',
        content: 'Leaders from opposing communities agreed to long-term cooperation and reconciliation...',
        image: 'https://via.placeholder.com/400x200',
        link: 'https://example.com/peace-deal',
        verified: true,
      },
      {
        id: 2,
        title: 'Youth Peace Training Launched',
        content: 'Over 100 youth from different counties attended workshops on peacebuilding...',
        image: 'https://via.placeholder.com/400x200',
        link: 'https://example.com/peace-training',
        verified: true,
      },
    ];

    setNewsList(sampleNews);
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const { title, content, image, link } = newArticle;

    if (title && content) {
      const newNews = {
        id: Date.now(), // unique ID
        title,
        content,
        image: image || 'https://www.unicef.org/',
        link: link || '#',
        verified: true,
      };

      setNewsList([newNews, ...newsList]);
      setNewArticle({ title: '', content: '', image: '', link: '' });
    }
  };

  return (
    <div className="verified-news-container">
      <h2 className="news-title">📰 Verified Peace News</h2>

      {isAdmin && (
        <form className="news-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="News title"
            value={newArticle.title}
            onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
            required
          />
          <textarea
            placeholder="News content"
            value={newArticle.content}
            onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
            required
          />
          <input
            type="url"
            placeholder="Image URL (optional)"
            value={newArticle.image}
            onChange={(e) => setNewArticle({ ...newArticle, image: e.target.value })}
          />
          <input
            type="url"
            placeholder="External Link (optional)"
            value={newArticle.link}
            onChange={(e) => setNewArticle({ ...newArticle, link: e.target.value })}
          />
          <button type="submit" className="btn btn-primary">Post News</button>
        </form>
      )}

      <div className="news-list">
        {newsList.length > 0 ? (
          newsList.map((news) => (
            <a
              key={news.id}
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="news-item clickable"
            >
              <img src={news.image} alt={news.title} className="news-image" />
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
