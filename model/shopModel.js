const {fruitsDb}  = require('../config/pg');

async function findAllfruits() {
    const fruits = await fruitsDb.query(
        `
        SELECT * FROM fruits
        `
    );
    return fruits.rows;
}

module.exports = {findAllfruits};