const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const User = require(__dirname + '/src/userschema');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/simplepayDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
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
        name: req.body.username,
        lastName: req.body.lastname,
        email: req.body.usermail,
        password: req.body.password,
      });
      newUser.save((error) => {
        if (error) console.log(err);
        else res.render('secrets');
      });
    }
  });
});

app.get('/submit', (req, res) => {
  res.render('submit');
});

app.get('/secrets', (req, res) => {
  res.render('secrets');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
