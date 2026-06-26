import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
.then(()=> {
    console.log(" Database is connected to MongoDB!");
})
.catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

const  app = express();
//Middleware to handle CORS
app.use(cors(
    {origin: process.env.FRONTEND_URL || "http://localhost:5173",
     methods: ["GET", "POST", "PUT", "DELETE"], 
     allowedHeaders: ["Content-Type", "Authorization"]  
    }
));
// Middleware to handle JSON requests
app.use(express.json());

// For using profile image 
app.use("/upload", express.static("upload"));

app.listen(5000, () => {
    console.log("Server is running on port 5000!");
});

app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error"; 

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
    })
})
