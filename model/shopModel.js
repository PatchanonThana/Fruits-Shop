const {fruitsDb}  = require('../config/pg');

async function findAllfruits() {
    const fruits = await fruitsDb.query(
        `
        SELECT * FROM fruits;
        `
    );
    return fruits.rows;
}

async function findByUsernameAndPassword(username,password) {
    const user = await fruitsDb.query(
        `
        SELECT username FROM users
        WHERE username = $1
        AND password_db = crypt($2,password_db);
        `, [username,password]
    );
    return user.rows[0];
}

module.exports = {findAllfruits, findByUsernameAndPassword};