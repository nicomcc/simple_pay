require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const User = require(__dirname + '/src/userschema');

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
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login', { loginError: '' });
});

app.post('/login', (req, res) => {
  const user = req.body.usermail;
  const pass = req.body.password;
  User.findOne({ email: user }, (err, foundUser) => {
    if (!foundUser) {
      res.render('login', { loginError: 'User not found' });
    } else if (foundUser.password === pass) {
      res.render('secrets', { firstName: foundUser.name });
    } else {
      res.render('login', { loginError: 'Password does not match' });
    }
  });
});

app.get('/register', (req, res) => {
  res.render('register', { registerError: '' });
});

app.post('/register', (req, res) => {
  User.find({ email: req.body.usermail }, (err, users) => {
    if (users.length > 0) {
      res.render('register', { registerError: 'E-mail already registered!' });
    } else {
      const newUser = new User({
        name: _.capitalize(req.body.username),
        lastName: _.capitalize(req.body.lastname),
        email: req.body.usermail,
        password: req.body.password,
      });
      newUser.save((error) => {
        if (error) res.render('register', { registerError: 'Empty Field' });
        else res.render('secrets', { firstName: newUser.name });
      });
    }
  });
});

app.get('/submit', (req, res) => {
  res.render('submit', { firstName: '' });
});


app.listen(3000, () => { console.log('Server started on port 3000'); });
