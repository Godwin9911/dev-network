const mongoose = require('mongoose');

const ConnectionSchema = new mongoose.Schema({
  connections: {
    type: String,
    required: true
  },
});

const Connection = mongoose.model('Connection', ConnectionSchema);

module.exports = Connection;
