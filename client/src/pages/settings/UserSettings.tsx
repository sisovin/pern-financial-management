import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { auth } from '../../services/auth';

const UserSettings = () => {
  const { user, logout } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setEmail(user.email);
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await auth.updateProfile({ username, email, firstName, lastName });
      alert('Profile updated successfully');
    } catch (error) {
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      alert('Logged out successfully');
    } catch (error) {
      setError('Failed to logout');
    }
  };

  return (
    <div className="user-settings">
      <h2>User Settings</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleUpdateProfile}>
        <div>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <label>Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default UserSettings;
