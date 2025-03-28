import React, { useState } from 'react';
import authService from '../../services/authService';

const TwoFactorVerification = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.verifyTwoFactorAuth(code);
      // Handle successful verification
    } catch (err) {
      setError('Invalid code. Please try again.');
    }
  };

  return (
    <div>
      <h2>Two-Factor Verification</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Enter the code sent to your device:
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <button type="submit">Verify</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default TwoFactorVerification;
