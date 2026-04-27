const express = require('express');
const controller = require('../controller/shopController');

const route = express.Router();

route.get('/', (req,res) => res.redirect('/shop-page'))

route.get('/login-page', controller.showLoginPage);
route.post('/login', controller.login);
route.get('/register-page', controller.showRegisterPage);
route.post('/register', controller.register);

route.get('/shop-page', controller.showShopPage);
//route.get('/fruit/:id', controller.showFruit);

route.get('/categories', controller.showCategoriesPage);

route.get('/cart-page', controller.showCartPage);
route.post('/add-cart', controller.updateOrAddCart);
route.post('/remove-cart', controller.removeCart);

module.exports = route