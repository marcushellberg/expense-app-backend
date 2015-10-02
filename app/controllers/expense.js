'use strict';
let Expense = require('../models/expense');
let moment = require('moment');
module.exports = {
  create: function(req, res) {
    // Copy over and sanitize contents
    let expense = {};
    expense.user = req.user.name;
    expense.merchant = req.body.merchant;
    expense.total = req.body.total;
    expense.date = new Date(req.body.date);
    expense.comment = req.body.comment;

    new Expense(expense).save(err => {
      res.json({
        success: err ? false : true
      });
    });
  },
  read: function(req, res) {
    let index = parseInt(req.query.index) || 0;
    let count = parseInt(req.params.count) || 50;
    let query = {
      user: req.user.name
    };
    let sortProperty = req.query.sort;
    let sortDirection = req.query.direction;
    let sort = '-date';
    let resultset = {
      metadata: {
        index: index,
        count: count
      }
    };

    if (sortProperty) {
      sort = sortProperty;
      if (sortDirection && sortDirection === 'asc') {
        sort = '-' + sort;
      }
    }

    // Ensure we get the metadata and query populated before running query
    new Promise(resolve => {
      if (index === 0) {
        // only return the full length on the first request
        Expense.count(query).then(count => {
          resultset.metadata.totalcount = count;
          resolve();
        });
      }
      resolve();
    }).then(() => {
      Expense.find(query).sort(sort).skip(index).limit(count).then(expenses => {
        resultset.result = expenses;
        res.json(resultset);
      });
    });
  },
  update: function(req, res) {
    res.send('Updating expense not implemented yet');
  },
  delete: function(req, res) {
    res.send('Deleting expense not implemented yet');
  },
  overview: function(req, res) {
    let resultset = {};

    Expense.aggregate([{
      $match: {
        $and: [{
          date: {
            $gt: moment().subtract(11, 'months').startOf('month').toDate()
          }
        }, {
          user: req.user.name
        }]
      }
    }, {
      $group: {
        _id: {
          month: {
            $month: '$date'
          },
          year: {
            $year: '$date'
          }
        },
        total: {
          $sum: '$total'
        }
      }
    }], (err, history) => {
      if (err) {
        console.log(err);
      }
      // Clean up result. You could probably already do this in the
      // aggregate function, but I couldn't figure out how
      history = history.map(el => {
        return {
          month: el._id.month,
          year: el._id.year,
          total: el.total
        };
      });
      history.sort((a, b) => {
        return a.year - b.year || a.month - b.month;
      });

      resultset.history = history;

      Expense.aggregate([{
        $match: {
          $and: [{
            status: 'New'
          }, {
            user: req.user.name
          }]
        }
      }, {
        $group: {
          _id: null,
          total: {
            $sum: '$total'
          }
        }
      }], (err, totalOwed) => {
        if (err) {
          console.log(err);
        }
        resultset.totalOwed = totalOwed[0].total;
        res.json(resultset);
      });
    });
  }
};