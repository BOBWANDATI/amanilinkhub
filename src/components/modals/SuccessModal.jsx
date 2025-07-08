import { FaCheckCircle } from 'react-icons/fa';
import '../styles/modals/SuccessModal.css';

const SuccessModal = ({ closeModal }) => {
  return (
    <div id="successModal" className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        <div className="success-content">
          <FaCheckCircle />
          <h3>Success!</h3>
          <p id="successMessage">Your submission has been received successfully.</p>
          <button className="btn btn-primary" onClick={closeModal}>OK</button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;