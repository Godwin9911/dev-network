const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: false
  },
  position: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  twitter: {
    type: String,
    required: false
  },
  github: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  date: {
    type: Date,
    default: Date.now
  },
  reset_id: {
    type: String,
    required: false
  },
  verified: {
    type: Boolean,
    required: false
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
