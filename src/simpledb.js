const User = require(__dirname + '/userschema');
const date = require(__dirname + '/date');

// check if waiting_funds transactions has reached payment day
exports.updateReceivables = (username) => {
  User.findOne({ username }, (err, selfUser) => {
    selfUser.transactions.forEach((transaction) => {
      if (transaction.paystatus === 'waiting_funds') {
        if (date.dateIsPast(date.getDate(), transaction.receivedate)) {
          transaction.paystatus = 'paid';
          selfUser.wallet = parseFloat(selfUser.wallet) + parseFloat(transaction.amount * 0.95);
        }
      }
    });
    selfUser.save((error) => {
      if (error) console.log(error);
    });
  });
};


exports.updateCardTransaction = (req, res, foundUser) => {
  // const firstname = _.capitalize(req.body.firstname);
  // const lastname = _.capitalize(req.body.lastname);
  const {
    username, transdescription, amount,
    inlineRadioOptions, cardholder, creditnumber, ccexpmo, ccexpyr,
  } = req.body;
  const transactionObject = {
    username, cardholder, creditnumber, amount, description: transdescription, paydate: date.getDate(),
  };
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

}
