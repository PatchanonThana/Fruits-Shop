const model = require('../model/shopModel');

exports.showLoginPage = (req,res) => {
    res.json({messasge:"This Is Login Page!"})
}

exports.login = async (req,res) => {
    const {username,password} = req.body;
    const user = await model.findByUsernameAndPassword(username,password);

    if (!user) {
        return res.status(401).json({error:"Invalid username or password"})
    }

    req.session.user = {
        user_id:user.user_id,
        username:user.username
    }

    res.json({
        message:"Login Success",
        session:req.session.user
    })
}

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

exports.showCartPage = async (req,res) => {
    const user = req.session.user;
    if (!user) {
        return res.redirect('/login-page')
    }
    const userCart = await model.Cart.findUserCart(user.user_id);
    const fruitDetail = await Promise.all(
        userCart.map( async cart => {
            const fruit = await model.Fruit.findFruitById(cart.fruit_id);
            console.log(fruit);
            console.log(cart.fruit_id);
            return {
                fruit_name:fruit.name,
                fruit_price:fruit.price,
                quantity:cart.quantity
            }
        })
    )
    const cart = {
        uesr_id:user.user_id,
        cart:fruitDetail
    }
    res.json(cart)
}

exports.addCart = async (req,res) => {
    try {
        const user = req.session.user;
        if (!user) {
            res.redirect('/login-page')
        }

        const {user_id,fruit_id,quantity} = req.body;
        const checker = await model.Cart.checkCart(user_id,fruit_id);

        if (checker.length > 0) {
            await model.Cart.updateCart(user_id,fruit_id,quantity);
            res.status(200).json({message:"Update Cart Success"})
        }
        else {
            await model.Cart.addCart(user_id,fruit_id,quantity);
            res.status(201).json({message:"Add new item Success"})
        }
    }
    catch (err) {
        return res.status(500).json({error:"Something Went wrong please try again"});
        console.error(err);
    }
}