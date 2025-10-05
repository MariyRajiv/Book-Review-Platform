const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
}, { collection: 'users' });

module.exports = mongoose.model('User', UserSchema);
