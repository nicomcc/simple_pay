// const mongoose = require('mongoose');
const User = require(__dirname + '/userschema');

exports.addClient = (selfUsername, firstname, lastname, username) => {
  const clientObject = { firstname, lastname, username };
  User.findOne({ selfUsername }, (err, selfUser) => {
    if (err) console.log(err);
    else if (!selfUser) console.log('User not found!');
    else {
      console.log(clientObject);
      //selfUser.clients.push(clientObject);
      selfUser.save((error) => {
        if (error) console.log(err);
        console.log(`Username: ${selfUsername}, ClientFirstname: ${firstname},
            ClientLastname: ${lastname}, ClientUsername: ${username}`);
      });
    }
  });
};

// code to access client list and add client pages
// app.get('/clientlist', (req, res) => {
//   if (req.isAuthenticated()) {
//     res.render('clientlist', { firstName: req.user.firstname });
//   } else {
//     res.redirect('/login');
//   }
// });
//
// app.get('/addclient', (req, res) => {
//   if (req.isAuthenticated()) {
//     res.render('addclient', { firstName: req.user.firstname, clientError: '' });
//   } else {
//     res.redirect('/login');
//   }
// });
//
// app.post('/addclient', (req, res) => {
//   const firstname = _.capitalize(req.body.firstname);
//   const lastname = _.capitalize(req.body.lastname);
//   const { username } = req.body;
//   simpleDB.addClient(req.user.username, firstname, lastname, username);
// });
