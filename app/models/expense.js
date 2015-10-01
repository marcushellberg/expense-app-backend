var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Expense', new Schema({
  user: String,
  date: Date,
  merchant: String,
  total: Number,
  status: String,
  comment: String
}));