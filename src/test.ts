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
