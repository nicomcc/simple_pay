require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const session = require('express-session');
const passport = require('passport');
// const passportLocalMongoose = require('passport-local-mongoose');

const User = require(__dirname + '/src/userschema');
const transactionSchema = require(__dirname + '/src/transactionSchema')
const date = require(__dirname + '/src/date.js');

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

app.get('/wallet', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('wallet', {
      firstName: req.user.firstname,
      walletcash: req.user.wallet,
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
    inlineRadioOptions, holdername, creditnumber, ccexpmo, ccexpyr, cvcnumber,
  } = req.body;

  User.findOne({ username }, (err, foundUser) => {
    if (err) res.render('payment', { paymentError: err });
    else if (!foundUser) {
      res.render('payment', { paymentError: 'Username not found!' });
    } else if (foundUser.firstname === firstname && foundUser.lastname === lastname) {
      foundUser.transactions.push({
        cardholder: holdername,
        description: transdescription,
        cvc: cvcnumber,
        amount,
        paydate: date.getDate(),
        expiredate: `${ccexpmo}/${ccexpyr}`,
        cardnumberfinal: creditnumber.substring(creditnumber.length - 4, creditnumber.length),
        paytype: (inlineRadioOptions === 'debit') ? 'debit_card' : 'credit_card',
      });
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
    res.render('transfer', { firstName: req.user.firstname });
  } else {
    res.redirect('/login');
  }
});

app.get('/transaction', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('transaction', { firstName: req.user.firstname });
  } else {
    res.redirect('/login');
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

app.listen(3000, () => { console.log('Server started on port 3000'); });
