import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EnterEmail = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8001/sendPasswordResetEmail', { email });
      setSuccessMessage('A password reset link has been sent to your email.');
      console.log(response);
    } catch (err) {
      setError('Error sending reset email. Please try again.');
      console.log(err);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Enter Your Email</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded" 
        >
          Send Reset Link
        </button>
      </form>
      {error && <p className="text-red-600">{error}</p>}
      {successMessage && <p className="text-green-600">{successMessage}</p>}
    </div>
  );
};

export default EnterEmail;
