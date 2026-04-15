const express = require('express');
const controller = require('../controller/shopController');

const route = express.Router();

route.get('/', (req,res) => res.redirect('/login-page'))
route.get('/login-page', controller.showLoginPage);
route.post('/login', controller.login);
route.get('/shop-page', controller.showShopPage);
route.get('/fruit/:id', controller.showFruit);
route.get('/cart-page', controller.showCartPage);
route.post('/add-cart', controller.addCart);

module.exports = route