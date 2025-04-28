import React from 'react'
import { useNavigate } from 'react-router-dom'

const Oops = () => {
 const Navigate = useNavigate();
  return (
    <div className="text-center mt-20 text-gray-500">
  <p className="text-lg mb-2">You haven’t saved any passwords yet.</p>
  <button
    onClick={() => Navigate("/addnewpassword")}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
  >
    + Add Your First Password
  </button>
</div>

  )
}

export default Oops