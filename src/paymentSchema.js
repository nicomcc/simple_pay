const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  description: String,
  clientuser: String,
  clientname: String,
  clientlastname: String,
  amount: Number,
  paytype: String,
  paydate: String,
  receivedate: String,
});

module.exports = paymentSchema;
