'use strict';
let express = require('express');
let cors = require('cors');


module.exports = (app) => {
  let apiRoutes = express.Router();
  let expenseController = require('./controllers/expense');
  let authenticationController = require('./controllers/authentication')(app);

  // Enable CORS headers
  apiRoutes.use(cors());

  // Authentication and access control
  apiRoutes.post('/authenticate', authenticationController.authenticate);
  apiRoutes.use(authenticationController.tokenMiddleware);

  // Expense routes
  apiRoutes.post('/expenses', expenseController.create);
  apiRoutes.get('/expenses', expenseController.read);
  apiRoutes.put('/expenses/:id', expenseController.update);
  apiRoutes.delete('/expenses/:id', expenseController.delete);
  apiRoutes.get('/expenses/overview', expenseController.overview);

  apiRoutes.get('/image/:id', (req, res) => {
    res.send('Hello, this is image');
  });

  app.use('/api/v1', apiRoutes);
};