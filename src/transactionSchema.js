const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  description: String,
  username: String,
  cardholder: String,
  cardnumberfinal: String,
  amount: Number,
  paytype: String,
  paydate: String,
  receivedate: String,
  expiredate: String,
});

module.exports = transactionSchema;
