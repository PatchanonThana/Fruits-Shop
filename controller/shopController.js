const model = require('../model/shopModel');

const isPositiveInteger = (value) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0;
};

const requireLogin = (req, res) => {
    if (!req.session.user) {
        res.redirect('/login-page?notLoginYet=1');
        return true;
    }
    return false;
};

const requireAdminApi = (req, res) => {
    if (!req.session.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return true;
    }
    if (req.session.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Forbidden' });
        return true;
    }
    return false;
};

exports.showLoginPage = (req, res) => {
    return res.render('login');
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).redirect('/login-page?invalid=1');
    }

    const user = await model.User.findByEmailAndPassword(email.trim(), password);
    if (!user) {
        return res.status(401).redirect('/login-page?auth=1');
    }

    req.session.regenerate((err) => {
        if (err) {
            console.error('Session regeneration failed:', err);
            return res.status(500).redirect('/login-page?error=1');
        }

        req.session.user = {
            user_id: user.user_id,
            email: user.email,
            role: user.role
        };

        return res.redirect('/shop-page');
    });
};

exports.showRegisterPage = (req, res) => {
    return res.render('register');
};

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, confirmPassword } = req.body;

        if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
            return res.status(400).redirect('/register-page?invalid=1');
        }

        if (password !== confirmPassword) {
            return res.status(400).redirect('/register-page?difPass=1');
        }

        const check = await model.User.checkUser(email.trim(), phone.trim());
        const dupMail = check.find(c => c.email === email.trim());
        const dupPhone = check.find(c => c.phone === phone.trim());

        if (dupMail) {
            return res.status(400).redirect('/register-page?dupMail=1');
        }

        if (dupPhone) {
            return res.status(400).redirect('/register-page?dupPhone=1');
        }

        const newUser = await model.User.insertNewUser(
            email.trim(),
            password,
            'USER',
            firstName.trim(),
            lastName.trim(),
            phone.trim()
        );

        if (!newUser) {
            console.error('Unable to create new user');
            return res.status(500).redirect('/register-page?error=1');
        }

        return res.status(201).redirect('/login-page?registered=1');
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).redirect('/register-page?error=1');
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.redirect('/shop-page');
        }

        res.clearCookie('connect.sid');
        return res.redirect('/login-page?loggedOut=1');
    });
};

exports.getBestSeller = (allFruits) => {
    const bestSellers = [
        allFruits.find(f => f.name === 'Durian'),
        allFruits.find(f => f.name === 'Mango'),
        allFruits.find(f => f.name === 'Watermelon'),
        allFruits.find(f => f.name === 'Blueberry'),
        allFruits.find(f => f.name === 'Pineapple')
    ];

    const bestsellerColors = ['#A8D86E', '#FFD93D', '#FF6B6B', '#C77DFF', '#FFAB40'];
    bestSellers.forEach((item, index) => {
        if (item) {
            item.cardColor = bestsellerColors[index];
        }
    });

    return bestSellers;
};

exports.showShopPage = async (req, res) => {
    if (requireLogin(req, res)) {
        return;
    }

    const categories = await model.Fruit.findAllCategories();
    const allFruits = await model.Fruit.findAllfruits();
    const bestSellers = exports.getBestSeller(allFruits);

    return res.render('index', { bestSellers, categories, allFruits });
};

exports.showCategoriesPage = async (req, res) => {
    if (requireLogin(req, res)) {
        return;
    }

    const activeCategory = req.query.cat || 'all';
    const allFruits = await model.Fruit.findAllfruits();
    const categories = await model.Fruit.findAllCategories();
    const filteredFruits = activeCategory === 'all'
        ? allFruits
        : allFruits.filter(f => f.category === activeCategory);

    return res.render('categories', { categories, allFruits: filteredFruits, activeCategory });
};

exports.showCartPage = async (req, res) => {
    if (requireLogin(req, res)) {
        return;
    }

    const user = req.session.user;
    const userCart = await model.Cart.findUserCart(user.user_id);
    const cartItems = await Promise.all(
        userCart.map(async (cart) => {
            const fruit = await model.Fruit.findFruitById(cart.fruit_id);
            if (!fruit) {
                return null;
            }
            return {
                fruit_id: fruit.fruit_id,
                name: fruit.name,
                price: fruit.price,
                image_path: fruit.image_path,
                categories: fruit.categories,
                desc: fruit.description,
                qty: cart.quantity
            };
        })
    );

    const validCartItems = cartItems.filter(Boolean);
    const subtotal = validCartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    return res.render('cart', { cartItems: validCartItems, subtotal });
};

exports.updateOrAddCart = async (req, res) => {
    try {
        if (requireLogin(req, res)) {
            return;
        }

        const user_id = req.session.user.user_id;
        const fruit_id = parseInt(req.body.fruit_id, 10);
        const quantity = parseInt(req.body.quantity, 10);

        if (!isPositiveInteger(fruit_id) || !isPositiveInteger(quantity)) {
            return res.status(400).json({ error: 'Invalid fruit_id or quantity' });
        }

        const fruit = await model.Fruit.findFruitById(fruit_id);
        if (!fruit) {
            return res.status(404).json({ error: 'Fruit not found' });
        }

        const cartItem = await model.Cart.checkCart(user_id, fruit_id);
        if (cartItem) {
            const newQuantity = Number(cartItem.quantity) + quantity;
            await model.Cart.updateCart(user_id, fruit_id, newQuantity);
        } else {
            await model.Cart.addCart(user_id, fruit_id, quantity);
        }

        const userCart = await model.Cart.findUserCart(user_id);
        const cartCount = userCart.reduce((sum, item) => sum + Number(item.quantity), 0);
        const message = cartItem ? 'Update Cart Success' : 'Add new item Success';

        return res.status(200).json({ message, cartCount });
    } catch (err) {
        console.error('Cart update error:', err);
        return res.status(500).json({ error: 'Something went wrong, please try again' });
    }
};

exports.updateFruitPrice = async (req, res) => {
    try {
        if (requireAdminApi(req, res)) {
            return;
        }

        const fruit_id = parseInt(req.body.fruit_id, 10);
        const price = Number(req.body.price);

        if (!isPositiveInteger(fruit_id) || typeof price !== 'number' || Number.isNaN(price) || price <= 0) {
            return res.status(400).json({ error: 'Invalid fruit_id or price' });
        }

        const fruit = await model.Fruit.findFruitById(fruit_id);
        if (!fruit) {
            return res.status(404).json({ error: 'Fruit not found' });
        }

        const updated = await model.Fruit.updateFruitPrice(fruit_id, price);
        if (!updated) {
            return res.status(500).json({ error: 'Unable to update price' });
        }

        return res.json({ message: 'Price updated', fruit: updated });
    } catch (err) {
        console.error('Admin price update error:', err);
        return res.status(500).json({ error: 'Unable to update price' });
    }
};

exports.removeCart = async (req, res) => {
    try {
        if (requireLogin(req, res)) {
            return;
        }

        const user_id = req.session.user.user_id;
        const fruit_id = parseInt(req.body.fruit_id, 10);

        if (!isPositiveInteger(fruit_id)) {
            return res.status(400).json({ error: 'Invalid fruit_id' });
        }

        await model.Cart.removeCart(user_id, fruit_id);
        const userCart = await model.Cart.findUserCart(user_id);
        const itemAmount = userCart.length;
        const cartCount = userCart.reduce((sum, item) => sum + Number(item.quantity), 0);

        return res.json({ cartAmount: itemAmount, cartCount });
    } catch (err) {
        console.error('Remove cart error:', err);
        return res.status(500).json({ error: 'Unable to remove item from cart' });
    }
};

exports.showCheckoutPage = async (req, res) => {
    if (requireLogin(req, res)) {
        return;
    }

    const user = req.session.user;
    const userCart = await model.Cart.findUserCart(user.user_id);

    if (!userCart || userCart.length === 0) {
        return res.redirect('/cart-page');
    }

    const cartItems = await Promise.all(
        userCart.map(async (cart) => {
            const fruit = await model.Fruit.findFruitById(cart.fruit_id);
            if (!fruit) {
                return null;
            }
            return {
                fruit_id: fruit.fruit_id,
                name: fruit.name,
                price: fruit.price,
                image_path: fruit.image_path,
                desc: fruit.description,
                qty: cart.quantity
            };
        })
    );

    const validCartItems = cartItems.filter(Boolean);
    if (validCartItems.length === 0) {
        return res.redirect('/cart-page');
    }

    const subtotal = validCartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const shipping = 0;
    const total = subtotal + shipping;

    return res.render('checkout', {
        cartItems: validCartItems,
        subtotal,
        shipping,
        total,
        activePage: 'checkout'
    });
};

exports.processCheckout = async (req, res) => {
    if (requireLogin(req, res)) {
        return;
    }

    try {
        const { fullName, address, city, postalCode, phone, paymentMethod } = req.body;

        if (!fullName || !address || !city || !postalCode || !phone || !paymentMethod) {
            return res.redirect('/checkout-page?invalid=1');
        }

        const user = req.session.user;
        const userCart = await model.Cart.findUserCart(user.user_id);

        if (!userCart || userCart.length === 0) {
            return res.redirect('/cart-page');
        }

        let total = 0;
        for (const item of userCart) {
            const fruit = await model.Fruit.findFruitById(item.fruit_id);
            if (!fruit) {
                continue;
            }
            total += fruit.price * item.quantity;
        }

        if (total <= 0) {
            return res.redirect('/cart-page');
        }

        await model.Cart.clearUserCart(user.user_id);
        return res.redirect('/checkout-success');
    } catch (err) {
        console.error('Checkout error:', err);
        return res.redirect('/checkout-page?error=1');
    }
};

exports.showCheckoutSuccess = (req, res) => {
    if (requireLogin(req, res)) {
        return;
    }
    return res.render('checkout-success', { activePage: 'checkout' });
};