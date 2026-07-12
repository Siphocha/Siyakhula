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
    "https://siyakhula.vercel.app/", //Vercel app goes here.
    "http://localhost:5173",
    // "https://your-frontend-domain.vercel.app" //Uncomment and add your frontend URL once deployed
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
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