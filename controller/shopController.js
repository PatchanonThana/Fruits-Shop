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

exports.login = async (req,res) => {
    const {username,password} = req.body;
    const user = await model.findByUsernameAndPassword(username,password);

    if (!user) {
        return res.status(401).json({error:"Invalid username or password"})
    }

    req.session.user = {
        username:user.username
    }

    res.json({
        message:"Login Success",
        session:req.session.user
    })
}

exports.showLoginPage = (req,res) => {
    res.json({messasge:"This Is Login Page!"})
}