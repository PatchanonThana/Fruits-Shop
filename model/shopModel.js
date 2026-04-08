const {fruitsDb}  = require('../config/pg');

async function findAllfruits() {
    return await fruitsDb[0];
}

module.exports = {findAllfruits};