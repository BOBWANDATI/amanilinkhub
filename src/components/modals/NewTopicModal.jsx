import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import '../styles/modals/NewTopicModal.css';

const NewTopicModal = ({ closeModal, showSuccessModal }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    description: ''
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
    <div id="newTopicModal" className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        <h3>Start New Discussion</h3>
        <form id="newTopicForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="topicTitle">Discussion Title *</label>
            <input 
              type="text" 
              id="topicTitle" 
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required 
              placeholder="Brief, descriptive title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="topicCategory">Category *</label>
            <select 
              id="topicCategory" 
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select category</option>
              <option value="water">Water Conflicts</option>
              <option value="cattle">Cattle Theft</option>
              <option value="land">Land Disputes</option>
              <option value="youth">Youth Issues</option>
              <option value="community">Community Relations</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="topicLocation">Location *</label>
            <input 
              type="text" 
              id="topicLocation" 
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required 
              placeholder="County, Ward, or specific area"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="topicDescription">Description *</label>
            <textarea 
              id="topicDescription" 
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required 
              placeholder="Describe the issue and what you hope to achieve through discussion..." 
              rows="4"
            ></textarea>
          </div>
          
          <button type="submit" className="btn btn-primary btn-large">
            <FaPlus />
            Start Discussion
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewTopicModal;