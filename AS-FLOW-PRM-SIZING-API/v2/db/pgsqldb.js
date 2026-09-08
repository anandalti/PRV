
    require('dotenv').config();
    const { Pool } = require('pg');
    // const pool = new Pool({
    //     host: process.env.DB_HOST,
    //     port: process.env.DB_PORT,
    //     database: process.env.DB_NAME,
    //     user: process.env.DB_USER,
    //     password: process.env.DB_PASS
    // });

    // const pool = new Pool({
    //     host: process.env.DB_HOST,
    //     port: process.env.DB_PORT,
    //     database: process.env.DB_NAME,
    //     user: process.env.DB_USER,
    //     password: process.env.DB_PASS,
    //     ssl: process.env.DB_HOST === 'localhost' ? false : {
    //         rejectUnauthorized: false
    //     },
    // });

    const pool = new Pool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        min: 2,                      // always keep 2 warm connections alive
        max: 10,
        idleTimeoutMillis: 60000,    // keep idle connections for 60s (was 10s default)
        connectionTimeoutMillis: 15000,
        ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false },
    });

    
    module.exports = {
        pool
    };
    