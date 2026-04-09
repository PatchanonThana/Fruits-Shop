const {Pool} = require('pg');
require('dotenv').config();

const fruitsDb = new Pool({
  user: process.env.NEON_USER,
  host: process.env.NEON_HOST,
  database: process.env.NEON_DB,
  password: process.env.NEON_PASSWORD, 
  port: Number(process.env.NEON_PORT) || 5432,
  ssl: {
    rejectUnauthorized: false 
  },
});

async function connectDb() {
    try {
        const res = await fruitsDb.query('SELECT NOW()');
        console.log(`Connect database success.
                     Time: ${res.rows[0].now}`)
    }
    catch(err) {
        console.log('Connect database failed')
        console.error(err);
    }
}


module.exports = {fruitsDb,connectDb};