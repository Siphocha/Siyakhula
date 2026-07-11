const { Pool } = require("pg");
require("dotenv").config();

//Initialise!
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for secure cloud databases like Neon
    }
});

//Testing just for now.
pool.connect((err, client, release) => {
    if (err) {
        console.error("Error acquiring client", err.stack);
    } else {
        console.log("PostgreSQL Connected successfully");
        release();
    }
});

//User table creation
const initializeDatabase = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE,
            password TEXT,
            wallet_address TEXT UNIQUE,
            role TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log("Database tables verified/created.");
    } catch (err) {
        console.error("Error creating database tables:", err.message);
    }
};

initializeDatabase();

//Export the pool for the controllers
module.exports = pool;