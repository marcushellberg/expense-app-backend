'use strict'
let express = require('express');
let User = require('./models/user');
let Expense = require('./models/expense');
let cors = require('cors');
let jwt = require('jsonwebtoken');

module.exports = (app) => {
  let apiRoutes = express.Router();

  //Enable CORS headers
  apiRoutes.use(cors());

  apiRoutes.post('/authenticate', (req, res) => {
    console.log(req.body);
    User
      .findOne({
        name: req.body.username
      })
      .then(user => {
        if (!user) {
          console.log('user not found');
          res.json({
            success: false,
            message: 'Authentication failed.'
          });
        } else {
          user.comparePasswords(req.body.password, (err, matches) => {
            if (err || !matches) {
              res.json({
                success: false,
                message: 'Authentication failed.'
              });
            } else {
              let token = jwt.sign(user, app.get('secret'), {
                expiresInMinutes: 1440
              });
              res.json({
                success: true,
                token: token
              });
            }
          });
        }
      })
      .catch(err => {
        throw err
      });
  });

  // Middleware for token authentication
  apiRoutes.use((req, res, next) => {
    let token = req.headers['x-access-token'];

    if (token) {
      jwt.verify(token, app.get('secret'), (err, decoded) => {
        if (err) {
          return res.status(403).send({
            success: false,
            message: 'Failed to authenticate token'
          });
        }
        req.user = decoded;
        next();
      });
    } else {
      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });
    }
  });

  apiRoutes.get('/expenses', (req, res) => {
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
    new Promise((resolve, reject) => {
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
  });

  app.use('/api/v1', apiRoutes);
}
