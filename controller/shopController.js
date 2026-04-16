const model = require('../model/shopModel');

exports.showLoginPage = (req, res) => {
    return res.render('login')
}

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await model.findByUsernameAndPassword(username, password);

    if (!user) {
        return res.status(401).json({ error: "Invalid username or password" })
    }

    req.session.user = {
        user_id: user.user_id,
        username: user.username
    }

    return res.json({
        message: "Login Success",
        session: req.session.user
    })
}

exports.showRegisterPage = (req, res) => {
    res.render('register');
}

exports.getBestSeller = (allFruits) => {
    const bestSellers = [
        allFruits.find(f => f.name === 'Durian'),
        allFruits.find(f => f.name === 'Mango'),
        allFruits.find(f => f.name === 'Watermelon'),
        allFruits.find(f => f.name === 'Blueberry'),
        allFruits.find(f => f.name === 'Pineapple'),
    ];
    const bestsellerColors = ['#A8D86E', '#FFD93D', '#FF6B6B', '#C77DFF', '#FFAB40'];
    bestSellers.forEach((item, i) => { if (item) item.cardColor = bestsellerColors[i]; });
    return bestSellers;
}

exports.showShopPage = async (req, res) => {
    // const user = req.session.user;
    // if (!user) {
    //     return res.redirect('/login-page');
    // }
    const categories = await model.Fruit.findAllCategories();
    const allFruits = await model.Fruit.findAllfruits();
    const bestSellers = this.getBestSeller(allFruits);
    return res.render('index', { bestSellers, categories, allFruits });

}

// exports.showFruit = async (req, res) => {
//     // const user = req.session.user;
//     // if (!user) {
//     //     return res.redirect('/login-page');
//     // }
//     const fruit_id = Number(req.params.id);
//     const fruit_info = await model.Fruit.findFruitById(fruit_id);
//     if (!fruit_info || Object.keys(fruit_info).length <= 0) {
//         return res.status(400).json({ message: `No Such a fruit id: ${fruit_id}` });
//     }
//     return res.json(fruit_info);
// }

exports.showCategoriesPage = async (req,res) => {
    const activeCategory = req.query.cat || 'all';
    const allFruits = await model.Fruit.findAllfruits();
    const categories = await model.Fruit.findAllCategories();
    let filteredFruits = allFruits;
    if (activeCategory !== 'all') {
        filteredFruits = allFruits.filter(f => f.category === activeCategory);
    }
    return res.render('categories', {categories, allFruits: filteredFruits, activeCategory})
}

exports.showCartPage = async (req, res) => {
    // const user = req.session.user;
    // if (!user) {
    //     return res.redirect('/login-page')
    // }
    const userCart = await model.Cart.findUserCart(2); /*user.user_id*/
    const cartItems = await Promise.all(
        userCart.map(async cart => {
            const fruit = await model.Fruit.findFruitById(cart.fruit_id);
            return {
                fruit_id:fruit.fruit_id,
                name: fruit.name,
                price: fruit.price,
                image_path: fruit.image_path,
                categories: fruit.categories,
                desc: fruit.description,
                qty: cart.quantity
            }
        })
    )
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    return res.render('cart', {cartItems,subtotal});
}

exports.updateOrAddCart = async (req, res) => {
    try {
        // const user = req.session.user;
        // if (!user) {
        //     return res.redirect('/login-page')
        // }

        const { user_id, fruit_id, quantity } = req.body;
        const checker = await model.Cart.checkCart(user_id, fruit_id);
        
        if (checker.length > 0) {
            await model.Cart.updateCart(user_id, fruit_id, quantity);
            const checker_2 = await model.Cart.findUserCart(user_id,fruit_id);
            const totalItems = checker_2.reduce((sum, item) => sum + Number(item.quantity), 0);
            return res.status(200).json({ message: "Update Cart Success" , cartCount:totalItems})
        }
        else {
            await model.Cart.addCart(user_id, fruit_id, quantity);
            const checker_2 = await model.Cart.findUserCart(user_id);
            const totalItems = checker_2.reduce((sum, item) => sum + Number(item.quantity), 0);
            return res.status(201).json({ message: "Add new item Success" , cartCount:totalItems});
        }
    }
    catch (err) {
        return res.status(500).json({ error: "Something Went wrong please try again" });
        console.error(err);
    }
}

exports.removeCart = async (req,res) => {
    const {user_id,fruit_id} = req.body;
    await model.Cart.removeCart(user_id,fruit_id);
    const userCart = await model.Cart.findUserCart(user_id);
    const itemAmount = userCart.length;
    const itemCount = userCart.reduce((sum,item) => sum + Number(item.quantity),0);
    return res.json({cartAmount:itemAmount, cartCount:itemCount});
}