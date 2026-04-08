const express = require('express');
const controller = require('../controller/shopController');

const route = express.Router();

route.get('/', controller.showShopPage);

module.exports = route