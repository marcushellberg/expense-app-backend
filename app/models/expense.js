'use strict';
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let statuses = ['New', 'In Progress', 'Reimbursed'];

module.exports = mongoose.model('Expense', new Schema({
  user: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  merchant: {
    type: String,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: statuses,
    default: 'New'
  },
  receipt: {
    type: String,
    required: true
  },
  comment: String

}));