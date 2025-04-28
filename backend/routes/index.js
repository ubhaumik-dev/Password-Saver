require('dotenv').config();
console.log('JWT_SECRET is:', process.env.JWT_SECRET);
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const Password = require('../models/passwordModels');
const verifyToken = require('../middleware/verifyToken');
const nodemailer = require('nodemailer');



// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/passwordSaver', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Failed to connect to MongoDB", err));

const secretKey = 'your-secret-key';

const algorithm = 'aes-256-cbc';
const key = crypto.createHash('sha256').update(String(process.env.SECRET_KEY || 'myverysecurekey1234567890123456')).digest('base64').substr(0, 32); // ensures 32 bytes
const iv = crypto.randomBytes(16); 

// Helper functions
const isValidGmail = (email) => {
  const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return gmailRegex.test(email);
};

const isSecurePassword = (password) => {
  return password.length >= 8;
};
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, "your-jwt-secret", (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });

    req.user = user;
    next();
  });
}
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted; // Save IV with encrypted data
}
function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedText = parts.join(':');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all fields" });
    }

    if (!isValidGmail(email)) {
      return res.status(400).json({ message: "Please provide a valid Gmail address" });
    }

    if (!isSecurePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Generate a token with the userId included in the payload
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '3h' });

    // Send back the token
    res.status(201).json({ message: "Signup successful", token });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error while signing up", error: err.message });
  }
});
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate a token with the userId included in the payload
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '3h' });

    // Send back the token
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.post('/addnewpassword', async (req, res) => {
  const { name, username, password } = req.body;
  const token = req.headers['authorization']?.split(' ')[1]; // Extract token from authorization header

  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }

  // Verify the token and get userId from it
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check if all required fields are provided
    if (!name || !username || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Encrypt the password before saving it to DB
    const encryptedPassword = encrypt(password);

    // Create a new password document
    const newPassword = new Password({
      userId,       // Store the userId from the decoded token
      name,         // Name of the service
      username,     // Username associated with the service
      password: encryptedPassword,  // Store the encrypted password
    });

    // Save the new password to the database
    await newPassword.save();
    res.status(201).json({ message: 'Password saved successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error while saving the password', error: err });
  }
});
router.get('/getpasswordbyid/:id', verifyToken, async (req, res) => {
  const { id } = req.params; // Get ID from the URL parameters

  if (!id) return res.status(400).json({ message: 'ID is required' });

  try {
    const found = await Password.findById(id);

    if (!found) return res.status(404).json({ message: 'Password not found' });

    const decryptedPassword = decrypt(found.password);

    res.status(200).json({
      ...found.toObject(),
      password: decryptedPassword,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

router.get('/getpasswords', verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // Get the userId from the token
    const passwords = await Password.find({ userId }); // Fetch passwords for the current user

    if (!passwords || passwords.length === 0) {
      return res.status(404).json({ message: 'No passwords found' });
    }

    // Decrypt passwords before sending them to the frontend
    const decryptedPasswords = passwords.map(password => ({
      ...password.toObject(),
      password: decrypt(password.password) // Decrypting the password
    }));

    res.status(200).json({ passwords: decryptedPasswords });
  } catch (err) {
    console.error('Error fetching passwords:', err);
    res.status(500).json({ message: 'Error fetching passwords' });
  }
});

router.delete('/deletepassword/:id', verifyToken, async (req, res) => {
  const { id } = req.params; // Get ID from the URL parameters

  if (!id) return res.status(400).json({ message: 'ID is required' });

  try {
    // Find the password by ID and delete it
    const deletedPassword = await Password.findByIdAndDelete(id);
    console.log("password with id not found", id);
    if (!deletedPassword) {
      return res.status(404).json({ message: 'Password not found' });
    
    }

    res.status(200).json({ message: 'Password deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error while deleting the password', error: err });
  }
});

router.put('/editpassword/:id', async (req, res) => {
  const { id } = req.params; // Get the ID from the URL
  const { name, username, password } = req.body; // Get the new data from the request body

  // Validate the input
  if (!name || !username || !password) {
    return res.status(400).json({ message: "Please provide all fields" });
  }

  try {
    // Find the password by ID
    const passwordDoc = await Password.findById(id);

    if (!passwordDoc) {
      return res.status(404).json({ message: "Password not found" });
    }

    // Update the password fields
    passwordDoc.name = name;
    passwordDoc.username = username;
    passwordDoc.password = encrypt(password); // Encrypt the new password

    // Save the updated password
    await passwordDoc.save();

    res.status(200).json({ message: "Password updated successfully", updatedPassword: passwordDoc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error while updating the password", error: err });
  }
});

router.post('/sendPasswordResetEmail', async (req, res) => {
  const { email } = req.body;
  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Generate reset token
    const token = crypto.randomBytes(32).toString('hex');

    // 3. Save token and expiration to user model (update your User model if it doesn't have these fields)
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour from now
    await user.save();

    // 4. Setup Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // from your .env file
        pass: process.env.EMAIL_PASS, // from your .env file
      },
    });

    // 5. Send the reset email
    const resetLink = `http://localhost:3000/resetpassword/${token}`; // Your frontend page link
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request this, please ignore this email.</p>
      `
    });

    res.status(200).json({ message: 'Password reset link sent to your email.' });

  } catch (err) {
    console.error("Error in sending password reset email:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// PUT THIS into your index.js with other routes
router.put('/resetpassword/:resetToken', async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  try {
    // 1. Find user with valid resetToken and not expired
    const user = await User.findOne({
      resetToken,
      resetTokenExpiration: { $gt: Date.now() }, // $gt: greater than current time
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token.' });
    }

    // 2. Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Update user password and clear resetToken fields
    user.password = hashedPassword;
    user.resetToken = undefined; // Clear the reset token after use
    user.resetTokenExpiration = undefined; // Clear the expiration date

    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });

  } catch (err) {
    console.error('Error resetting password:', err);
    res.status(500).json({ message: 'Error resetting password.' });
  }
});


router.get('/user', verifyToken, async(req,res)=>{
  const UserId = req.userId;

  try{
    const user = await User.findById(UserId);
    console.log('JWT Secret:', process.env.JWT_SECRET); // Add this to check the secret
    console.log(process.env.JWT_SECRET);  // Log this to check if it's loaded

    if(!user){
      return res.status(400).json({message :"User not found"});
    }
    res.status(200).json({name: user.name, email: user.email})
  } catch (err)
  {
    console.log('JWT Secret:', process.env.JWT_SECRET);
    console.log("Error fetching data",err);
    res.status(500).json({message: 'Server Error'});
  }
})

module.exports = router;