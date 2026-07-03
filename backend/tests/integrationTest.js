const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const BASE_URL = "http://localhost:5000";

const db = new sqlite3.Database(
    path.join(__dirname, "../database/siyakhula.db")
);

const testUser = {
    email: `investor${Date.now()}@test.com`,
    password: "123456",
    walletAddress: "0xf39Fd6eVROOMVROOMYUP51aad88F6F4ce6a2266",
    role: "investor"
};

async function runTests() {

    console.log("\nSIYAKHULA BACKEND TESTING\n");

    //Signup, signup, signup!

    try {

        const signup = await axios.post(
            `${BASE_URL}/api/auth/signup`,
            testUser
        );

        console.log("User registration is working");

        console.log("\nSignup Response:");
        console.log(signup.data);

        if (signup.data.token) {

            console.log("JWT generator is working!");

            console.log("\nJWT Token Preview is successful");
            console.log(
                signup.data.token.substring(0, 50) + "..."
            );
        }

    } catch (err) {

        console.log("User registration failed");
        console.log(err.response?.data || err.message);
    }

    //Testing the Login sequence

    try {

        const login = await axios.post(
            `${BASE_URL}/api/auth/login`,
            {
                email: testUser.email,
                password: testUser.password
            }
        );

        console.log("Login is working");

        console.log("\nLogin Response:");
        console.log(login.data);

        if (login.data.role === "investor") {

            console.log("Roles are working!");

            console.log("\nDetected Role:");
            console.log(login.data.role);
        }

    } catch (err) {

        console.log("Login failed");
        console.log(err.response?.data || err.message);
    }

    // Lets check on the SQLite database.

    db.get(
        "SELECT * FROM users WHERE email = ?",
        [testUser.email],
        (err, row) => {

            if (err) {

                console.log("SQLite query is failing");
                return;
            }

            if (row) {

                console.log("SQLite stores users SUCCESSFULLY!");

                console.log("\nDatabase Record:");
                console.log(row);

                if (
                    row.password &&
                    row.password !== testUser.password
                ) {

                    console.log("Password hashing is working");

                    console.log("\nStored Password Hash:");
                    console.log(row.password);

                } else {

                    console.log("Password hashing has failed");
                }

            } else {

                console.log("User query is null unfortunately");
            }

            db.close();

            console.log("\nTESTS COMPLETE\n");
        }
    );
}

runTests();