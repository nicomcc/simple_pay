const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  description: String,
  username: String,
  firstname: String,
  lastname: String,
  amount: Number,
  paytype: String,
  paydate: String,
  receivedate: String,
  cardnumberfinal: String,
  expiredate: String,
});

module.exports = paymentSchema;
