import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Settings = () => {
  const [user, setUser] = useState(null);  // State to store user info
  const [loading, setLoading] = useState(true);  // State to manage loading state
  const navigate = useNavigate();

  // Fetch user info when component mounts
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8000/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        console.log('Fetched user data:', response.data);  // Log the response data to debug
        console.log('token is',token);
        console.log('JWT Secret:', process.env.JWT_SECRET);

        // Assuming response.data contains the user object
        setUser(response.data); // Set the fetched user data
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        const token = localStorage.getItem('token');
        console.error('Error fetching user info:', error.response ? error.response.data : error.message);
        console.log('token is',token);
        console.log('JWT Secret:', process.env.JWT_SECRET);
        setLoading(false); // Set loading to false in case of an error
      }
    };

    fetchUserInfo(); // Call the function to fetch user info
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Display loading message while fetching
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow">
        <h2 className="text-xl font-bold p-6">🔒Password Saver</h2>
        <ul>
          <li className="px-6 py-3 hover:bg-gray-100" onClick={() => navigate('/')}>Dashboard</li>
          <li className="px-6 py-3 hover:bg-gray-100">Add New</li>
          <li className="px-6 py-3 bg-blue-100">Settings</li>
        </ul>
      </aside>

      <div className="flex-1 p-10 bg-gray-50">
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>

        <div className="bg-white shadow-md rounded-2xl p-6 max-w-md">
          <div className="mb-4">
            <label className="text-gray-600 block mb-1">Account</label>
            <div className="text-gray-800 font-medium">Email</div>
            <div className="text-gray-700">{user ? user.email : 'Loading...'}</div>  {/* Display email */}
          </div>

          <div className="mb-4">
            <label className="text-gray-600 block mb-1">Name</label>
            <div className="text-gray-800 font-medium">Full Name</div>
            <div className="text-gray-700">{user ? user.name : 'Loading...'}</div>  {/* Display name */}
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
            onClick={() => navigate('/enteremail')}>
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
