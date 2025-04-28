import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-blue-100 to-blue-300">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-blue-700">🔒 PassVault</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/signup')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-blue-700 rounded"
          >
            Signup
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col justify-center items-center text-center p-8">
        <h2 className="text-4xl font-bold text-blue-800 mb-4">
          Welcome to PassVault
        </h2>
        <p className="text-lg text-blue-700 mb-8">
          Your trusted companion to safely store and manage your passwords.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/signup')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-lg"
          >
            Get Started
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 bg-white shadow-inner text-blue-600">
        Made with ❤️ by Udita
      </footer>
    </div>
  );
};

export default LandingPage;
