const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const transactionSchema = require(__dirname + '/transactionSchema');
const paymentSchema = require(__dirname + '/paymentSchema');
const clientSchema = require(__dirname + '/clientSchema');


const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  wallet: {
    type: Number,
    default: 0,
  },
  transactions: [transactionSchema],
  payments: [paymentSchema],
  clients: [clientSchema],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
