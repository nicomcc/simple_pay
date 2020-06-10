require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const session = require('express-session');
const passport = require('passport');
// const passportLocalMongoose = require('passport-local-mongoose');

const User = require(__dirname + '/src/userschema');
const date = require(__dirname + '/src/date');
const simpleDB = require(__dirname + '/src/simpledb');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/simplepayDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set('useCreateIndex', true);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect('wallet');
  } else {
    res.render('home');
  }
});

app.get('/login', (req, res) => {
  res.render('login', { loginError: '' });
});

app.post('/login', (req, res) => {
  const newuser = new User({
    username: req.body.username,
    password: req.body.password,
  });
  passport.authenticate('local', (err, user) => {
    if (!user) { return res.render('login', { loginError: 'Invalid Credentials' }); }
    req.logIn(newuser, (error) => {
      if (error) { return res.render('login', { loginError: error }); }
      // check if any waiting_funds transactions has reached payment day on login
      simpleDB.updateReceivables(req.user.username);
      return res.redirect('wallet');
    });
  })(req, res);
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/register', (req, res) => {
  res.render('register', { registerError: '' });
});

app.post('/register', (req, res) => {
  const firstname = _.capitalize(req.body.firstname);
  const lastname = _.capitalize(req.body.lastname);
  const { username } = req.body;

  User.register({ username, firstname, lastname }, req.body.password, (err, user) => {
    if (err) {
      res.render('register', { registerError: err });
    } else {
      passport.authenticate('local')(req, res, () => {
        res.redirect('wallet');
      });
    }
  });
});

app.get('/wallet', (req, res) => {
  if (req.isAuthenticated()) {
    const receivedTransactions = req.user.transactions.filter((transaction) => {
      return transaction.paystatus === 'paid';
    });
    const toReceiveTransactions = req.user.transactions.filter((transaction) => {
      return transaction.paystatus === 'waiting_funds';
    });

    res.render('wallet', {
      userName: req.user.username,
      walletcash: req.user.wallet,
      debittransactions: receivedTransactions,
      credittransactions: toReceiveTransactions,
    });
  } else {
    res.redirect('/login');
  }
});

app.get('/payment', (req, res) => {
  res.render('payment', { paymentError: '' });
});

app.post('/payment', (req, res) => {
  const firstname = _.capitalize(req.body.firstname);
  const lastname = _.capitalize(req.body.lastname);
  const {
    username, transdescription, amount,
    inlineRadioOptions, cardholder, creditnumber, ccexpmo, ccexpyr,
  } = req.body;
  const transactionObject = {
    username, cardholder, creditnumber, amount, description: transdescription, paydate: date.getDate(),
  };

  User.findOne({ username }, (err, foundUser) => {
    if (err) res.render('payment', { paymentError: err });
    else if (!foundUser) {
      res.render('payment', { paymentError: 'Username not found!' });
      // check if info matchs
    } else if (foundUser.firstname === firstname && foundUser.lastname === lastname) {
      transactionObject.receivedate = (inlineRadioOptions === 'credit') ? date.addDays(date.getDate(), 30) : date.getDate();
      transactionObject.paystatus = (inlineRadioOptions === 'debit') ? 'paid' : 'waiting_funds';
      transactionObject.expiredate = `${ccexpmo}/${ccexpyr}`;
      transactionObject.cardnumberfinal = creditnumber.substring(creditnumber.length - 4,
        creditnumber.length);
      transactionObject.paytype = (inlineRadioOptions === 'debit') ? 'debit_card' : 'credit_card';
      foundUser.transactions.push(transactionObject);
      // adds value to wallet if pay method is debit, 3% taxes
      if (inlineRadioOptions === 'debit') {
        foundUser.wallet = parseFloat(foundUser.wallet) + parseFloat(amount * 0.97);
      }
      foundUser.save((error) => {
        if (!error) res.redirect('/paymentsuccesfull');
        else res.render('payment', { paymentError: error });
      });
    } else {
      res.render('payment', { paymentError: 'User data does not match!' });
    }
  });
});

app.get('/paymentsuccesfull', (req, res) => {
  res.render('paymentsuccesfull');
});

app.get('/transfer', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('transfer', { userName: req.user.username, paymentError: '', cardpayment: false });
  } else {
    res.redirect('/login');
  }
});


app.get('/transaction', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('transaction', { userName: req.user.username, payments: req.user.payments });
  } else {
    res.redirect('/login');
  }
});

app.post('/transfer', (req, res) => {
  const firstname = _.capitalize(req.body.firstname);
  const lastname = _.capitalize(req.body.lastname);
  const {
    username, transdescription, amount,
    inlineRadioOptions, cardholder, creditnumber, ccexpmo, ccexpyr,
  } = req.body;
  const paymentObject = {
    description: transdescription, username, firstname, lastname, amount, paydate: date.getDate(),
  };
  const transactionObject = {
    username, cardholder, creditnumber, amount, description: transdescription, paydate: date.getDate(),
  };
  User.findOne({ username }, (err, foundUser) => {
    if (err) res.render('transfer', { userName: req.user.username, paymentError: err, cardpayment: false });
    // check if user is registered
    else if (!foundUser) {
      res.render('transfer', { userName: req.user.username, paymentError: 'User not found', cardpayment: false });
      // check if info matchs
    } else if (foundUser.firstname === firstname && foundUser.lastname === lastname) {
      // check payment method if user is found and info matches
      User.findOne({ username: req.user.username }, (errors, selfUser) => {
        if (creditnumber == null) { // Transfer Payment
          if (selfUser.wallet >= amount) { // if wallet fund is enough
            transactionObject.receivedate = date.getDate();
            transactionObject.paytype = 'wallet_transfer';
            transactionObject.paystatus = 'paid';
            foundUser.transactions.push(transactionObject);
            // updates wallet fund
            selfUser.wallet = parseFloat(selfUser.wallet) - parseFloat(amount);
            foundUser.wallet = parseFloat(foundUser.wallet) + parseFloat(amount);
            foundUser.save((error) => {
              if (error) res.render('transfer', { userName: req.user.username, paymentError: error, cardpayment: false });
            });
            paymentObject.paytype = 'wallet_transfer';
            selfUser.payments.push(paymentObject);
            selfUser.save((error) => {
              if (!error) res.redirect('/paymentsuccesfull');
              else res.render('transfer', { userName: req.user.username, paymentError: error, cardpayment: false });
            });
          } else { // if wallet fund is not enought
            res.render('transfer', { userName: req.user.username, paymentError: 'Wallet fund is not enough!', cardpayment: false });
          }
        } else { // Card Payment
          transactionObject.receivedate = (inlineRadioOptions === 'credit') ? date.addDays(date.getDate(), 30) : date.getDate();
          transactionObject.expiredate = `${ccexpmo}/${ccexpyr}`;
          transactionObject.cardnumberfinal = creditnumber.substring(creditnumber.length - 4,
            creditnumber.length);
          transactionObject.paystatus = (inlineRadioOptions === 'debit') ? 'paid' : 'waiting_funds';
          transactionObject.paytype = (inlineRadioOptions === 'debit') ? 'debit_card' : 'credit_card';
          foundUser.transactions.push(transactionObject);
          // adds value to wallet if pay method is debit, 3% taxes
          if (inlineRadioOptions === 'debit') {
            foundUser.wallet = parseFloat(foundUser.wallet) + parseFloat(amount * 0.97);
          }
          foundUser.save((error) => {
            if (error) res.render('transfer', { userName: req.user.username, paymentError: error, cardpayment: false });
          });
          paymentObject.paytype = (inlineRadioOptions === 'debit') ? 'debit_card' : 'credit_card';
          selfUser.payments.push(paymentObject);
          selfUser.save((error) => {
            if (!error) res.redirect('/paymentsuccesfull');
            else res.render('transfer', { userName: req.user.username, paymentError: error, cardpayment: false });
          });
        }
      });
    } else {
      res.render('transfer', { userName: req.user.username, paymentError: 'User data does not match!', cardpayment: false });
    }
  });
});

app.post('/transfer-paymethod', (req, res) => {
  if (req.body.paymethod === 'card') {
    res.render('transfer', { userName: req.user.username, paymentError: '', cardpayment: true });
  } else {
    res.render('transfer', { userName: req.user.username, paymentError: '', cardpayment: false });
  }
});

app.listen(3000, () => { console.log('Server started on port 3000');
});
