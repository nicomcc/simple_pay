const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const transactionSchema = require(__dirname + '/transactionSchema')


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
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
