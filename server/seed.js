import bcrypt from "bcrypt";
import User from "./models/User.js";
import connectDB from "./db/connection.js";

const register = async () => {
    try {
        await connectDB();
        const email = "admin@gmail.com";
        const existing = await User.findOne({ email });
        if (existing) {
            console.log("Admin user already exists, skipping creation");
            process.exit(0);
        }

        const hashPassword = await bcrypt.hash("admin", 10);
        const newUser = new User({
            name: "admin",
            email,
            password: hashPassword,
            address: "admin address",
            role: "admin"
        });

        await newUser.save();
        console.log("Admin user created successfully");
        process.exit(0);
    } catch (error) {
        if (error.code === 11000) {
            console.log("Duplicate key detected — admin user already exists.");
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

register();