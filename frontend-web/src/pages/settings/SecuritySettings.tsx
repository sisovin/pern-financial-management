import React, { useState } from 'react';
import TwoFactorAuth from '../../components/auth/TwoFactorAuth';

const SecuritySettings: React.FC = () => {
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  const handleTwoFactorToggle = () => {
    setIsTwoFactorEnabled(!isTwoFactorEnabled);
  };

  return (
    <div>
      <h1>Security Settings</h1>
      <div>
        <h2>Two-Factor Authentication</h2>
        <label>
          <input
            type="checkbox"
            checked={isTwoFactorEnabled}
            onChange={handleTwoFactorToggle}
          />
          Enable Two-Factor Authentication
        </label>
        {isTwoFactorEnabled && <TwoFactorAuth />}
      </div>
    </div>
  );
};

export default SecuritySettings;
