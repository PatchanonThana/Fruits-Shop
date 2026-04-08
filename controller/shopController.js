const model = require('../model/shopModel');

exports.showShopPage = async (req, res) => {
    const data = await model.findAllfruits();
    return res.json(data);
}