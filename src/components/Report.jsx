import { useState } from 'react';
import { FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import '../components/styles/Report.css';

const BASE_URL = 'https://backend-m6u3.onrender.com';

const Report = ({ setShowSuccessModal }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    incidentType: '',
    location: '',
    locationName: '',
    date: '',
    description: '',
    urgency: '',
    anonymous: false,
    followUp: false,
  });

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
            ...prev,
            location: `${latitude.toFixed(6)},${longitude.toFixed(6)}`,
            locationName: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
          }));
        },
        (err) => {
          console.error('❌ Geolocation error:', err);
          alert('Could not retrieve your location. Please allow location access.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('❌ Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.location || !formData.incidentType || !formData.date || !formData.description || !formData.urgency) {
      alert('⚠️ Please fill all required fields and use your current location.');
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      if (key !== 'locationName') {
        form.append(key, typeof val === 'boolean' ? val.toString() : val);
      }
    });

    files.forEach((file) => form.append('files', file));

    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/report/submit`, {
        method: 'POST',
        body: form,
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        alert('✅ Report submitted successfully!');
        if (typeof setShowSuccessModal === 'function') {
          setShowSuccessModal(true);
        }
        setFormData({
          incidentType: '',
          location: '',
          locationName: '',
          date: '',
          description: '',
          urgency: '',
          anonymous: false,
          followUp: false,
        });
        setFiles([]);
      } else {
        console.error('❌ Submission failed:', data);
        alert(data.msg || 'Failed to submit report');
      }
    } catch (err) {
      setLoading(false);
      console.error('❌ Network/server error:', err);
      alert('Server error. Please try again later.');
    }
  };

  return (
    <div id="report" className="page">
      <div className="container">
        <h2 className="page-title">Report An Incident</h2>
        <p className="page-subtitle">Help build peace by reporting conflicts in your community</p>

        <div className="report-form-container">
          <form className="report-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="incidentType">Type of Incident *</label>
              <select
                id="incidentType"
                name="incidentType"
                value={formData.incidentType}
                onChange={handleInputChange}
                required
              >
                <option value="">Select incident type</option>
                <option value="theft">Theft/Robbery</option>
                <option value="fight">Physical Fight</option>
                <option value="shooting">Shooting/Violence</option>
                <option value="cattle">Cattle Theft</option>
                <option value="land">Land Dispute</option>
                <option value="water">Water Conflict</option>
                <option value="domestic">Domestic Violence</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="locationName">Location *</label>
                <input
                  type="text"
                  id="locationName"
                  name="locationName"
                  value={formData.locationName}
                  onChange={handleInputChange}
                  placeholder="Place name (optional)"
                />
                <input type="hidden" name="location" value={formData.location} />
                <button type="button" className="btn btn-secondary" onClick={getCurrentLocation}>
                  <FaMapMarkerAlt /> Use Current Location
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date & Time *</label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what happened..."
                required
                rows="5"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="media">Upload Media (Optional)</label>
              <input
                type="file"
                id="media"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
              {files.length > 0 && (
                <div className="file-preview">
                  {files.map((file, i) => (
                    <div key={i} className="file-preview-item">{file.name}</div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="urgency">Urgency Level *</label>
              <select
                id="urgency"
                name="urgency"
                value={formData.urgency}
                onChange={handleInputChange}
                required
              >
                <option value="">Select urgency level</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="anonymous"
                  name="anonymous"
                  checked={formData.anonymous}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                Report anonymously
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="followUp"
                  name="followUp"
                  checked={formData.followUp}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                I want updates on this report
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? 'Submitting...' : (
                <>
                  <FaPaperPlane /> Submit Report
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Report;
