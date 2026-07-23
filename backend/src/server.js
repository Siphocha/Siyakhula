require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

require("./config/db");

const app = express();

const allowedOrigins = [
    "https://siyakhula.vercel.app",
    "http://localhost:5173",
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/investor", require("./routes/investorRoutes"));
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Backend running on ${PORT}`);
    // Oracle starts only when admin toggles it – NOT on boot
});