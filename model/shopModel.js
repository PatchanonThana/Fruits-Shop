const { fruitsDb } = require('../config/pg');

const Fruit = {

    findAllfruits: async () => {
        const fruits = await fruitsDb.query(
            `
            SELECT * FROM fruits;
            `
        );
        return fruits.rows;
    },

    findFruitById: async (fruit_id) => {
        const fruit = await fruitsDb.query(
            `
            SELECT * FROM fruits
            WHERE fruit_id = $1
            `, [fruit_id]
        );
        return fruit.rows[0];
    }
}


async function findByUsernameAndPassword(username, password) {
    const user = await fruitsDb.query(
        `
        SELECT user_id,username FROM users
        WHERE username = $1
        AND password_db = crypt($2,password_db);
        `, [username, password]
    );
    return user.rows[0];
}


const Cart = {

        findUserCart: async (user_id) => {

            const resutl = await fruitsDb.query(
                `
                SELECT * FROM cart
                WHERE user_id = $1;
                `, [user_id]
            )

            return resutl.rows || []

        },

        checkCart: async (user_id, fruit_id) => {
           
            const result = await fruitsDb.query(
                `
                SELECT * FROM cart
                WHERE user_id = $1 AND
                fruit_id = $2;
                `, [user_id, fruit_id]
            );

            return result.rows[0] || [];
            
        },

        addCart: async (user_id, fruit_id, quantity) => {
            await fruitsDb.query(
                `
                INSERT INTO cart (user_id,fruit_id,quantity)
                VALUES
                ($1,$2,$3);
                `, [user_id, fruit_id, quantity]
            );
        },


        updateCart: async (user_id, fruit_id, quantity) => {
            await fruitsDb.query(
                `
                UPDATE cart
                SET quantity = quantity + $3
                WHERE user_id = $1 AND fruit_id = $2;
                `, [user_id, fruit_id, quantity]
            );
        }
}



module.exports = {
    Fruit, findByUsernameAndPassword, Cart
};