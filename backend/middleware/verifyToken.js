require('dotenv').config();
const jwt = require('jsonwebtoken');
// In verifyToken.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });

  console.log('Token received:', token); // Add this line for debugging

  try {
    // Add this in verifyToken.js right before jwt.verify
console.log('About to verify with secret:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded); // Log the decoded token
    req.userId = decoded.id;
    next();
  } catch (err) {
    console.error('Error verifying token:', err);
    return res.status(403).json({ message: 'Invalid token' });
  }
};



module.exports = verifyToken;
