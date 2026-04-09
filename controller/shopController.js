const model = require('../model/shopModel');

exports.showShopPage = async (req, res) => {
    const fruits = await model.findAllfruits();
    return res.json(fruits.map(fruit => {
        return {
            specie:fruit.specie,
            price:fruit.price,
            stock:fruit.stock
        }
    }))
}