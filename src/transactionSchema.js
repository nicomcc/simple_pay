const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  description: String,
  cardholder: String,
  cardnumberfinal: String,
  cvc: Number,
  amount: Number,
  paytype: String,
  paydate: String,
  expiredate: String,
});

module.exports = transactionSchema;
