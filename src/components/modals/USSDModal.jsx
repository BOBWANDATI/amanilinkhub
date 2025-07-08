import { FaMobileAlt } from 'react-icons/fa';
import '../styles/modals/USSDModal.css';

const USSDModal = ({ closeModal }) => {
  return (
    <div id="ussdModal" className="modal">
      <div className="modal-content">
        <span className="close" onClick={closeModal}>&times;</span>
        <h3>USSD Reporting</h3>
        <div className="ussd-content">
          <FaMobileAlt />
          <p><strong>Dial *456*7# to report incidents without internet</strong></p>
          <div className="ussd-steps">
            <div className="ussd-step">
              <span className="step-number">1</span>
              <p>Dial <strong>*456*7#</strong> on any phone</p>
            </div>
            <div className="ussd-step">
              <span className="step-number">2</span>
              <p>Select "Report Incident"</p>
            </div>
            <div className="ussd-step">
              <span className="step-number">3</span>
              <p>Choose incident type and location</p>
            </div>
            <div className="ussd-step">
              <span className="step-number">4</span>
              <p>Provide brief description</p>
            </div>
          </div>
          <p><small>Available 24/7 • Works on all phones • Free service</small></p>
        </div>
      </div>
    </div>
  );
};

export default USSDModal;