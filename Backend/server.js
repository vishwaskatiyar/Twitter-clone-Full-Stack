import express from "express";
import dotenv from "dotenv"

import authRoutes from "./routes/auth.routes.js";
import connectMongoDB from "./db/connectMongoDB.js";
dotenv.config();
const app = express();

// console.log(process.env.MONGO_URI);
const PORT = process.env.PORT || 10000;

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
})