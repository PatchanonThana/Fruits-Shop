const express = require('express');
const app = express();
const session = require('express-session');
const model = require('./model/shopModel');

const path = require('path');
const { connectDb } = require('./config/db');
const routes = require('./routes/shopeRoutes');

const PORT = 3000;
const KEY = "SECRET-KEY"

async function startServer() {

    await connectDb();
    app.use(express.json());

    app.use(session({
        secret: KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 3
        }
    }));

    app.use(express.urlencoded({ extended: true }));

    app.use(async (req, res, next) => {
        try {
            let totalItems = 0;
            const testUserId = 2; 

            if (testUserId) {
                const userCart = await model.Cart.findUserCart(testUserId);
                
                if (userCart && Array.isArray(userCart)) {
                    totalItems = userCart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
                }
            }
            
            res.locals.cartCount = totalItems;
            next();
        } catch (err) {
            console.error("Cart Middleware Error:", err);
            res.locals.cartCount = 0;
            next();
        }
    });

    
    app.use(express.static(path.join(__dirname, 'public')));

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // app.use(async (req,res,next) => {
    //     console.log('access');
    //     try {
    //         let totalItems = 0;
    //         //user = req.session.user;
    //         if (true) { //user
    //             const userCart = await model.Cart.findUserCart(2); //user.user_id
    //             totalItems = userCart.reduce((sum, item) => sum + item.quantity, 0);
    //             console.log(totalItems);
    //             res.locals.cartCount = totalItems;
    //         }
            
    //         next();
    //     }
    //     catch (err) {
    //         res.locals.cartCount = 0;
    //         next()
    //     }
    // });

    

    app.use('/', routes);

    app.listen(PORT, () => {
        console.log(`Fruit Shop running on http://localhost:${PORT}`);
    });

}

startServer();

