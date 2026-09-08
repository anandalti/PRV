
require('dotenv').config();
function connectDB(){
const knex = require('knex')({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_DATABASE,
        ssl: {
          rejectUnauthorized: false
        },
      pool: {
        min: 2,
        max: 20
      },
      acquireConnectionTimeout: 50000
  }
});
  knex.raw('select 1+1 as result').catch(err => {
    console.log('DB Connection Error:', err);
    process.exit(1);
  });
  return knex;
}
module.exports = {
     connectDB
}

