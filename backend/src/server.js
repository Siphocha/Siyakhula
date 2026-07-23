require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

//Postgre SQL initialisation for frontend processes.
require("./config/db");

const app = express();

//EXPLICIT CORS CONFIG
const allowedOrigins = [
    "https://siyakhula.vercel.app",
    "http://localhost:5173",
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

//Handle preflight OPTIONS 
app.options('*', cors()); //Enabling for all routes

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/investor", require("./routes/investorRoutes"));
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend running on ${PORT}`);
    //Oracle starts only when admin toggles. STOP FROM STARTING AT BOOT.
});