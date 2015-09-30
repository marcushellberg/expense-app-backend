'use strict';
(() => {
  let mongoose = require('mongoose');
  let Schema = mongoose.Schema;

  module.exports = mongoose.model('User', new Schema({
    username: String,
    password: String
  }));
})();
