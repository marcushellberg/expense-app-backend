'use strict'
let User = require('./models/user');
let Expense = require('./models/expense');
let moment = require('moment');

module.exports.createUser = () => {
  // User.remove({});
  User.count({}).then(count => {
    if (count === 0) {
      new User({
        name: 'demo',
        password: 'demo'
      }).save(err => {
        if (err) {
          console.log('Failed to create demo user', err);
        }
        console.log('Created user demo:demo');
      });
    }
  }).catch(err => {
    console.log(err);
  });
};


module.exports.createExpenses = () => {
  //Expense.remove({}).then();
  Expense.count({}).then(count => {
    if (count === 0) {
      let date = moment();
      for (let i = 0; i < 10000; i++) {
        date = date.subtract(1, 'hours');
        let status = "New";
        if (i > 75) {
          status = "Reimbursed";
        } else if (i > 50) {
          status = "In Progress";
        }
        new Expense({
          user: 'demo',
          date: date,
          merchant: ['Electronics', 'Rental car', 'Airline', 'Hotel'][Math.floor(Math.random() * 4)],
          total: Math.random() * 300,
          status: status,
          comment: "No comments, please."
        }).save(err => {
          if (err) {
            console.log('Failed to create sample data', err);
          }
        });
      }
      console.log('Created sample data');
    }
  });
};
