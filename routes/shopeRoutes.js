const express = require('express');
const controller = require('../controller/shopController');

const route = express.Router();

route.get('/', (req,res) => res.redirect('/login-page'))
route.get('/login-page', controller.showLoginPage);
route.post('/login', controller.login);


module.exports = route