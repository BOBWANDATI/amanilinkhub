import { useState } from 'react';
import { FaMobileAlt, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import '../components/styles/Donation.css';

const Donation = () => {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionComplete, setTransactionComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formattedPhone = phoneNumber.startsWith('0')
      ? '254' + phoneNumber.slice(1)
      : phoneNumber;

    try {
      const response = await fetch('https://backend-m6u3.onrender.com/api/mpesa/stk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          amount: amount
        }),
      });

      const data = await response.json();
      console.log('M-Pesa response:', data);

      if (data.ResponseCode === '0') {
        setStep(3);
        setTransactionComplete(true);
      } else {
        alert('❌ STK Push failed: ' + (data.errorMessage || 'Unknown error'));
      }
    } catch (error) {
      console.error('M-Pesa Error:', error);
      alert('⚠️ Failed to connect to M-Pesa backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountSelection = (selectedAmount) => {
    setAmount(selectedAmount);
    setStep(2);
  };

  const resetForm = () => {
    setPhoneNumber('');
    setAmount('');
    setStep(1);
    setTransactionComplete(false);
  };

  return (
    <div id="donation" className="page">
      <div className="container">
        <h2 className="page-title">Support Peace Building</h2>
        <p className="page-subtitle">Make a donation via M-Pesa to support our peace initiatives</p>

        <div className="donation-layout">
          {/* Left: Video */}
          <div className="donation-media">
            <video width="100%" controls>
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Right: Donation Form */}
          <div className="donation-content">
            {!transactionComplete ? (
              <>
                {step === 1 && (
                  <div className="donation-step">
                    <h3>Select Donation Amount</h3>
                    <div className="amount-options">
                      <button className="amount-option" onClick={() => handleAmountSelection('100')}>KES 100</button>
                      <button className="amount-option" onClick={() => handleAmountSelection('500')}>KES 500</button>
                      <button className="amount-option" onClick={() => handleAmountSelection('1000')}>KES 1,000</button>
                      <button className="amount-option" onClick={() => handleAmountSelection('')}>Other Amount</button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <form className="donation-form" onSubmit={handleSubmit}>
                    <h3>Enter M-Pesa Details</h3>

                    <div className="form-group">
                      <label htmlFor="phone">M-Pesa Phone Number</label>
                      <div className="input-group">
                        <span className="prefix">+254</span>
                        <input
                          type="tel"
                          id="phone"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="7XX XXX XXX"
                          required
                          pattern="[0-9]{9}"
                          maxLength="9"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="amount">Amount (KES)</label>
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        required
                        min="10"
                      />
                    </div>

                    <div className="form-group">
                      <button type="submit" className="btn btn-primary" disabled={isLoading}>
                        {isLoading ? 'Processing...' : (
                          <>
                            <FaMoneyBillWave /> Donate Now
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="donation-complete">
                <FaCheckCircle className="success-icon" />
                <h3>Donation Successful!</h3>
                <p>Thank you for your generous donation of KES {amount}.</p>
                <p>A confirmation message to complete the transaction has been sent to +254{phoneNumber}.</p>
                <button className="btn btn-secondary" onClick={resetForm}>
                  Make Another Donation
                </button>
              </div>
            )}

            <div className="donation-info">
              <h4>How M-Pesa Donations Work</h4>
              <ol>
                <li>Enter your M-Pesa registered phone number</li>
                <li>Enter the amount you wish to donate</li>
                <li>Confirm the payment on your phone when prompted</li>
                <li>Receive a confirmation message from M-Pesa</li>
              </ol>

              <div className="notice">
                <p><strong>Note:</strong> Standard M-Pesa transaction charges apply.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donation;
