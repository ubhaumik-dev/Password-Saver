const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/passwordSaver');

// Add resetToken and resetTokenExpiration to the schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  resetToken: String,            // Store the reset token here
  resetTokenExpiration: Date,    // Store the expiration date for the token
});

// Make sure you're exporting the model correctly
const User = mongoose.model('User', userSchema);

module.exports = User;
