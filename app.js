const express = require('express');
const app = express();
const session = require('express-session');

const path = require('path');
const {connectDb}  = require('./config/pg');
const routes = require('./routes/shopeRoutes');

const PORT = 3000;
const KEY = "SECRET-KEY"



async function startServer() {

    await connectDb();

    app.use(express.urlencoded({extended:true}));
    app.use(express.static(path.join(__dirname,'public')));
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
    
    app.set('view engine','ejs');
    app.set('views',path.join(__dirname,'views'));


    app.use('/', routes);

    app.listen(PORT, () => {
        console.log(`server runnnig at http://localhost:${PORT} `)
    });

}

startServer();