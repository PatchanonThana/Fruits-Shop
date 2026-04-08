const express = require('express');
const path = require('path');
const PORT = 3000;

const app = express();
const routes = require('./routes/shopeRoutes');

function startServer() {

    app.use(express.urlencoded({extended:true}));
    app.use(express.static(path.join(__dirname,'public')));
    
    app.set('view engine','ejs');
    app.set('views',path.join(__dirname,'views'));


    app.get('/', (req,res) => res.redirect("/fruits-shop"));
    app.use('/fruits-shop', routes);

    app.listen(PORT, () => {
        console.log(`server runnnig at http://localhost:${PORT} `)
    });

}

startServer();