const db = require("../config/db");

//Jst users fr
const createUser = (
    email,
    hashedPassword,
    walletAddress,
    role
) => {

    return new Promise((resolve, reject) => {

        db.run(
            `
            INSERT INTO users
            (email,password,walletAddress,role)
            VALUES (?,?,?,?)
            `,
            [
                email,
                hashedPassword,
                walletAddress,
                role
            ],
            function (err) {

                if (err) reject(err);

                resolve(this.lastID);
            }
        );
    });
};

const findUserByEmail = (email) => {

    return new Promise((resolve, reject) => {

        db.get(
            "SELECT * FROM users WHERE email=?",
            [email],
            (err, row) => {

                if (err) reject(err);

                resolve(row);
            }
        );

    });
};

module.exports = {
    createUser,
    findUserByEmail
};