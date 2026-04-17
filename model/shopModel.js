const { fruitsDb } = require('../config/db');

const Fruit = {

    findAllCategories: async () => {
        const categories = await fruitsDb.query(
            `
            SELECT * FROM categories
            `
        )
        return categories.rows;
    },

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

const User = {
    findByEmailAndPassword: async (email, password) => {
        const user = await fruitsDb.query(
            `
        SELECT user_id,email,role FROM users
        WHERE email = $1
        AND password = crypt($2,password);
        `, [email, password]
        );
        return user.rows[0];
    }
}

const Cart = {

    findUserCart: async (user_id) => {

        const result = await fruitsDb.query(
            `
                SELECT * FROM cart
                WHERE user_id = $1;
                `, [user_id]
        )

        return result.rows || []

    },

    checkCart: async (user_id, fruit_id) => {

        const result = await fruitsDb.query(
            `
                SELECT * FROM cart
                WHERE user_id = $1 AND
                fruit_id = $2;
                `, [user_id, fruit_id]
        );

        return result.rows || [];

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
    },

    removeCart: async (user_id, fruit_id) => {
        await fruitsDb.query(
            `
                DELETE FROM cart
                WHERE user_id = $1 AND
                fruit_id = $2
                `, [user_id, fruit_id]
        );
    }
}



module.exports = {
    Fruit, User, Cart
};