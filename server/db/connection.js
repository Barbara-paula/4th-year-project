import mongoose from "mongoose";

const connectDB = async () => {
    try{
        if (!process.env.MONGO_URI) {
            console.warn("Warning: MONGO_URI not set in .env file");
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connection created successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        console.error("Server will continue running, but database operations will fail");
        // Don't exit - let the server run so we can test the API
    }
}

export default connectDB;