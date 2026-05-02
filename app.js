const express = require('express');
const app = express();
const session = require('express-session');
const model = require('./model/shopModel');
const path = require('path');
const { connectDb } = require('./config/db');
const routes = require('./routes/shopeRoutes');
const PORT = 3000;
const KEY = "SECRET-KEY";

async function startServer() {
    await connectDb();

    // === 1. Body Parsers ===
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // === 2. Static Files (CSS, JS, Images) — MUST be before routes ===
    app.use(express.static(path.join(__dirname, 'public')));

    // === 3. Session ===
    app.use(session({
        secret: KEY,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 3
        }
    }));

    // === 4. Global Middleware — Pass user + cart count to ALL views ===
    app.use(async (req, res, next) => {
        try {
            // Pass currentUser to every EJS template
            res.locals.currentUser = req.session.user || null;
            res.locals.cartCount = 0;

            // Calculate cart count if logged in
            if (req.session.user) {
                const userCart = await model.Cart.findUserCart(req.session.user.user_id);
                if (userCart && Array.isArray(userCart)) {
                    res.locals.cartCount = userCart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
                }
            }
        } catch (err) {
            console.error("Session/Cart Middleware Error:", err);
            res.locals.currentUser = null;
            res.locals.cartCount = 0;
        }
        next();
    });

    // === 5. View Engine ===
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    // === 6. Routes — MUST be LAST ===
    app.use('/', routes);

    // === 7. Start Server ===
    app.listen(PORT, () => {
        console.log(`🍉 Fruit Shop running on http://localhost:${PORT}`);
    });
}

startServer();