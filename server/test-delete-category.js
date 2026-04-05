import mongoose from "mongoose";
import { deleteCategory } from "./controllers/categoryController.js";
import dotenv from "dotenv";

dotenv.config();

async function test() {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/stockflow", {
    });
    console.log("Connected to MongoDB");

    // Create a mock req/res
    const req = {
        params: { id: "69d27feb685ea7afac541403" } // using the user's invalid/deleted ID to see if it causes 500
    };
    
    let statusCode;
    const res = {
        status: (code) => {
            statusCode = code;
            return res;
        },
        json: (data) => {
            console.log(`Status: ${statusCode}, Response:`, data);
        }
    };
    
    await deleteCategory(req, res);
    console.log("Test finished");
    process.exit(0);
}
test();
