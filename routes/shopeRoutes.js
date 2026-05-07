const express = require('express');
const router = express.Router();  // ← THIS LINE WAS MISSING!
const controller = require('../controller/shopController');

// ==========================================
// AUTH PAGES
// ==========================================
router.get('/login-page', controller.showLoginPage);
router.post('/login', controller.login);
router.get('/register-page', controller.showRegisterPage);
router.post('/register', controller.register);
router.get('/logout', controller.logout);

// ==========================================
// SHOP PAGES
// ==========================================
router.get('/', (req, res) => res.redirect('/login-page'));
router.get('/shop-page', controller.showShopPage);
router.get('/categories-page', controller.showCategoriesPage);
router.get('/cart-page', controller.showCartPage);

// ==========================================
// CHECKOUT
// ==========================================
router.get('/checkout-page', controller.showCheckoutPage);
router.post('/checkout', controller.processCheckout);
router.get('/checkout-success', controller.showCheckoutSuccess);

// ==========================================
// CART API (called by JavaScript fetch)
// ==========================================
router.post('/api/cart/update', controller.updateOrAddCart);
router.post('/api/cart/remove', controller.removeCart);

// ==========================================
// ADMIN API
// ==========================================
router.post('/api/admin/fruit/price', controller.updateFruitPrice);

module.exports = router;