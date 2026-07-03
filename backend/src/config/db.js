const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(
    __dirname,
    "../../database/siyakhula.db"
);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.log(err.message);
    } else {
        console.log("SQLite Connected");
    }
});

//If more fields are necessary we can add them later, IF they are. But records have the chain.
db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            walletAddress TEXT UNIQUE,
            role TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

});

module.exports = db;