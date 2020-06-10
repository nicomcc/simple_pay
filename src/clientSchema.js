const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  username: String,
  firstname: String,
  lastname: String,
});

module.exports = clientSchema;
