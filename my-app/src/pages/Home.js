import React, { useState, useEffect } from 'react';
import axios from 'axios'; // ✅ Correct
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Copy } from 'lucide-react'; // Make sure you install lucide-react
import Oops from './Oops'; // Import the Oops component
//import { useLocation } from 'react-router-dom';

const Home = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [editPasswordVisible, setEditPasswordVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [passwords, setPasswords] = useState([]);
  const [selectedItemToDelete, setSelectedItemToDelete] = useState(null);
  const Navigate = useNavigate();
  //const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    Navigate("/login");
  };


  const fetchPasswords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/getpasswords', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Fetched passwords:', response.data);
      setPasswords(response.data.passwords); // Adjust based on your API response structure
    } catch (err) {
      console.error('Failed to fetch passwords', err);
    }

  };

  useEffect(() => {
    fetchPasswords();
  }, []);

  // Toggle password visibility
  const toggleVisibility = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy password to clipboard
  const copyToClipboard = (password) => {
    navigator.clipboard.writeText(password);
    alert('Password copied to clipboard!');
  };

 const handleDeletePassword = async (item) => {
  if (!item || !item._id) {
    console.error("No selected item to delete!");
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const deleteId = item._id;  // use _id here
    console.log('Deleting password with ID:', deleteId);

    await axios.delete(`http://localhost:8000/deletepassword/${deleteId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    });

    setPasswords((prev) => prev.filter((p) => p._id !== deleteId));
    setShowDeleteModal(false);
    setSelectedItemToDelete(null);
  } catch (err) {
    console.log("error deleting password", err);
    alert("Failed to delete password");
  }
};


  return (
    <>
      <div className="flex h-screen bg-gray-100">
        <aside className="w-64 bg-white shadow">
          <h2 className="text-xl font-bold p-6">🔒 Password Saver</h2>
          <ul>
            <li className="px-6 py-3 bg-blue-100">Dashboard</li>
            <li
              className="px-6 py-3 hover:bg-gray-100"
              onClick={() => Navigate('/addnewpassword')}
            >
              Add New
            </li>
            <li className="px-6 py-3 hover:bg-gray-100" onClick={() => Navigate('/settings')}>
              Settings
            </li>
            <li className="px-6 py-3 hover:bg-gray-100" onClick={handleLogout}>Log Out</li>
          </ul>
        </aside>

        <main className="flex-1 p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Your Passwords</h1>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => Navigate('/addnewpassword')}
            >
              + Add Password
            </button>
          </div>

          {/* Show the Oops component if no passwords are saved */}
          {passwords.length === 0 ? (
            <Oops />
          ) : (
            <table className="w-full bg-white rounded shadow">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Username</th>
                  <th className="text-left p-4">Password</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
  {passwords.map((item) => (
    <tr key={item._id} className="border-b">
      <td className="p-4">{item.name}</td>
      <td className="p-4">{item.username}</td>
      <td className="p-4">
      <div className="relative w-64"> {/* Relative wrapper */}
  <input
    type={visiblePasswords[item._id] ? 'text' : 'password'}
    value={item.password}
    readOnly
    className="w-full pr-10 py-2 border border-gray-700 rounded pl-3 focus:outline-none focus:border-black overflow-hidden text-ellipsis"
  />
  
  {/* Eye button */}
  <button
    onClick={() => toggleVisibility(item._id)}
    className="absolute right-12 top-1/2 transform -translate-y-1/2"
  >
    {visiblePasswords[item._id] ? <Eye size={18} /> : <EyeOff size={18} />}
  </button>
  
  {/* Copy button */}
  <button
    onClick={() => copyToClipboard(item.password)}
    className="absolute right-3 top-1/2 transform -translate-y-1/2"
  >
    <Copy size={18} />
  </button>
</div>

      </td>
      <td className="p-4">
        <button
          className="bg-red-600 hover:bg-red-700 px-4 py-2 text-white rounded mr-4"
          onClick={() => {
            console.log("Setting item to delete:", item);
            setSelectedItemToDelete(item);
            setShowDeleteModal(true);
          }}
        >
          Delete
        </button>

        <button
          className="bg-green-600 hover:bg-green-700 px-4 py-2 text-white rounded"
          onClick={() => setEditingItem(item)}
        >
          Edit
        </button>
      </td>
    </tr>
  ))}
</tbody>

            </table>
          )}
        </main>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md text-center">
            <h2 className="text-xl font-semibold mb-4">⚠️ Confirm Deletion</h2>
            <p className="mb-6">
              Are you sure you want to delete the password for {''}<span className="font-bold">{selectedItemToDelete ? selectedItemToDelete.name : ""}</span>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button className="bg-red-600 hover:bg-red-700 px-4 py-2 text-white rounded mr-4"
              onClick={() => handleDeletePassword(selectedItemToDelete)}>Confirm Delete</button>


            </div>
          </div>
        </div>
      )}

      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Password</h2>
            <form
              onSubmit={ async (e) => {
                e.preventDefault();
                try {
                  const token = localStorage.getItem('token')
                  const response = await fetch (`http://localhost:8000/editpassword/${editingItem._id}`,{
                    method :"PUT",
                    headers :{
                      "Content-type" : "application/json",
                      "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      name: editingItem.name,
                      username : editingItem.username,
                      password: editingItem.password,
                    }),
                  });
                  if (response.ok) {
                    const updatedData = await  response.json();
                    
                    // Update the password list on frontend
                    setPasswords((prevPasswords) =>
                      prevPasswords.map((password) =>
                        password._id === editingItem._id ? updatedData.updatedPassword : password
                      )
                    );
      
                    setEditingItem(false); // Close the modal
                  } else {
                    console.error("Failed to update password");
                  }
               
              } catch(error)
              {
                console.log("password could not be edited", error);
              }
            }}
            >
              <input
                type="text"
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                placeholder="Name"
                className="w-full p-2 mb-4 border rounded"
              />
              <input
                type="text"
                value={editingItem.username}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, username: e.target.value })
                }
                placeholder="Username"
                className="w-full p-2 mb-4 border rounded"
              />

              {/* Password field with eye toggle */}
              <div className="relative mb-4">
                <input
                  type={editPasswordVisible ? 'text' : 'password'}
                  value={editingItem.password}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, password: e.target.value })
                  }
                  placeholder="Password"
                  className="w-full p-2 pr-10 border rounded"
                />
                <button
                  type="button"
                  onClick={() => setEditPasswordVisible((prev) => !prev)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {editPasswordVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
