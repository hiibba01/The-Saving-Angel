import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

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

app.listen(5000, () => {
    console.log("Server is running on port 5000!");
})