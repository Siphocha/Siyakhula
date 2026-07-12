require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

//Postgre SQL initialisation for frontend processes.
require("./config/db");

const app = express();

//Securing CORS config
const allowedOrigins = [
    "https://siyakhula.vercel.app", //Vercel app goes here....remember this man.
    "http://localhost:5173",
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use(
    "/api/auth",
    require("./routes/authRoutes")
);

app.use(
    "/api/investor",
    require("./routes/investorRoutes")
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend running on ${PORT}`);
});