const bcrypt = require("bcrypt");
const generateToken = require("../utils/jwt");

const {
    createUser,
    findUserByEmail
} = require("../models/userModel");

//Sign up controllers and queryinggg into database
exports.signup = async (req, res) => {

    try {

        const {
            email,
            password,
            walletAddress,
            role
        } = req.body;

        const existing =
            await findUserByEmail(email);

        if (existing) {

            return res.status(400).json({
                message: "User exists"
            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const id = await createUser(
            email,
            hashedPassword,
            walletAddress,
            role
        );

        const token = generateToken({
            id,
            email,
            role
        });

        res.status(201).json({
            token
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });
    }
};

//login controllers for logging in by queryign user data
exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        const user =
            await findUserByEmail(email);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }

        const valid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!valid) {

            return res.status(401).json({
                message: "Wrong password"
            });
        }

        const token = generateToken(user);

        res.json({
            token,
            role: user.role,
            walletAddress:
                user.walletAddress
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });
    }
};