import { useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import '../styles/modals/TestimonyModal.css';

const TestimonyModal = ({ closeModal, showSuccessModal }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    content: '',
    author: '',
    location: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    closeModal();
    showSuccessModal();
  };

  return (
    <div id="testimonyModal" className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        <h3>Share Your Peace Story</h3>
        <form id="testimonyForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="testimonyTitle">Story Title *</label>
            <input 
              type="text" 
              id="testimonyTitle" 
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required 
              placeholder="Give your story a meaningful title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="testimonyCategory">Category *</label>
            <select 
              id="testimonyCategory" 
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select category</option>
              <option value="reconciliation">Reconciliation</option>
              <option value="healing">Healing & Recovery</option>
              <option value="youth">Youth Leadership</option>
              <option value="women">Women Peacemakers</option>
              <option value="community">Community Building</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="testimonyContent">Your Story *</label>
            <textarea 
              id="testimonyContent" 
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Share your experience of peace, reconciliation, or healing..." 
              required 
              rows="6"
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="testimonyAuthor">Author Name</label>
            <input 
              type="text" 
              id="testimonyAuthor" 
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Your name (leave blank to remain anonymous)"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="testimonyLocation">Location</label>
            <input 
              type="text" 
              id="testimonyLocation" 
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="City, County (optional)"
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-large">
            <FaHeart />
            Share Story
          </button>
        </form>
      </div>
    </div>
  );
};

export default TestimonyModal;