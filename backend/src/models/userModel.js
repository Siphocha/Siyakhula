const db = require("../config/db");

//Jst users fr
const createUser = (
    email,
    hashedPassword,
    walletAddress,
    role
) => {

    return new Promise(async (resolve, reject) => {

        try {
            const res = await db.query(
                `
                INSERT INTO users
                (email, password, wallet_address, role)
                VALUES ($1, $2, $3, $4)
                RETURNING id
                `,
                [
                    email,
                    hashedPassword,
                    walletAddress,
                    role
                ]
            );
            resolve(res.rows[0].id);
        } catch (err) {
            reject(err);
        }
    });
};

const findUserByEmail = (email) => {

    return new Promise(async (resolve, reject) => {

        try {
            const res = await db.query(
                "SELECT id, email, password, wallet_address AS \"walletAddress\", role FROM users WHERE email = $1",
                [email]
            );
            resolve(res.rows[0] || null);
        } catch (err) {
            reject(err);
        }

    });
};

module.exports = {
    createUser,
    findUserByEmail
};