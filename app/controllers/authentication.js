'use strict';
let User = require('../models/user');
let jwt = require('jsonwebtoken');
module.exports = (app) => {

  return {
    authenticate: function(req, res) {
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
          throw err;
        });
    },
    tokenMiddleware: function(req, res, next) {
      let token = req.headers['x-access-token'] || req.body.token || req.query.token;

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
    }
  };
};