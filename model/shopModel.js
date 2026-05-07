const { fruitsDb } = require('../config/db');

// ============================================
// Fruit queries --- ใช้ parameterized statement ทุกคำสั่ง
// เพื่อป้องกัน SQL Injection แบบ 100%
// ============================================
const Fruit = {

    findAllCategories: async () => {
        const categories = await fruitsDb.query(
            `
            SELECT * FROM categories;
            `
        );
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
            WHERE fruit_id = $1;
            `,
            [fruit_id]
        );
        return fruit.rows[0] || null;
    },

    updateFruitPrice: async (fruit_id, price) => {
        const updated = await fruitsDb.query(
            `
            UPDATE fruits
            SET price = $2
            WHERE fruit_id = $1
            RETURNING fruit_id, price;
            `,
            [fruit_id, price]
        );
        return updated.rows[0] || null;
    }
};

const User = {

    checkUser: async (email, phone) => {
        const user = await fruitsDb.query(
            `
            SELECT email, phone FROM users
            WHERE email = $1 OR phone = $2;
            `,
            [email, phone]
        );
        return user.rows || [];
    },

    findByEmailAndPassword: async (email, password) => {
        // ใช้ PostgreSQL crypt() กับ salt ของตัวเอง
        // ซึ่งเป็นวิธี hashing แบบ Blowfish/Bcrypt ที่ปลอดภัย
        const user = await fruitsDb.query(
            `
            SELECT user_id, email, role FROM users
            WHERE email = $1
            AND password = crypt($2, password);
            `,
            [email, password]
        );
        return user.rows[0] || null;
    },

    insertNewUser: async (email, password, role, first_name, last_name, phone) => {
        const newUser = await fruitsDb.query(
            `
            INSERT INTO users (email, password, role, first_name, last_name, phone)
            VALUES ($1, crypt($2, gen_salt('bf')), $3, $4, $5, $6)
            RETURNING user_id;
            `,
            [email, password, role, first_name, last_name, phone]
        );
        return newUser.rows[0] || null;
    }
};
const Cart = {

    findUserCart: async (user_id) => {

        const result = await fruitsDb.query(
            `
                SELECT * FROM cart
                WHERE user_id = $1;
                `,
            [user_id]
        );
        return result.rows || [];
    },

    findCartItem: async (user_id, fruit_id) => {
        const result = await fruitsDb.query(
            `
            SELECT * FROM cart
            WHERE user_id = $1 AND fruit_id = $2;
            `,
            [user_id, fruit_id]
        );
        return result.rows[0] || null;
    },

    checkCart: async (user_id, fruit_id) => {
        return await Cart.findCartItem(user_id, fruit_id);
    },

    addCart: async (user_id, fruit_id, quantity) => {
        await fruitsDb.query(
            `
            INSERT INTO cart (user_id, fruit_id, quantity)
            VALUES ($1, $2, $3);
            `,
            [user_id, fruit_id, quantity]
        );
    },

    updateCart: async (user_id, fruit_id, quantity) => {
        await fruitsDb.query(
            `
            UPDATE cart
            SET quantity = $3
            WHERE user_id = $1 AND fruit_id = $2;
            `,
            [user_id, fruit_id, quantity]
        );
    },

    removeCart: async (user_id, fruit_id) => {
        await fruitsDb.query(
            `
            DELETE FROM cart
            WHERE user_id = $1 AND fruit_id = $2;
`,
            [user_id, fruit_id]
        );
    },

    clearUserCart: async (user_id) => {
        await fruitsDb.query(
            `
            DELETE FROM cart
            WHERE user_id = $1;
            `,
            [user_id]
        );
    }
};

module.exports = {
    Fruit,
    User,
    Cart
};