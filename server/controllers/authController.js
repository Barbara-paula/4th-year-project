import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import logAction from '../utils/auditService.js';

const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if (!user) {
            return res.status(401).json({success:false, message: "User not found"});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(401).json({success:false, message: "Invalid credentials"});
        }
        const token = jwt.sign({id: user._id, role: user.role}, process.env.JWT_SECRET, {expiresIn: '2d'})

        await logAction(user._id, user.name, "LOGIN", "User", user._id, `User ${user.email} logged in`, req.ip);

        return res.status(200).json({success: true, message: "login successful", token, user: {id: user._id, name: user.name, email: user.email, role:user.role}})
    }catch (error){
        console.error("Login error details:", {
            message: error.message,
            stack: error.stack,
            body: req.body,
            envVars: {
                MONGO_URI: process.env.MONGO_URI ? 'SET' : 'NOT SET',
                JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
            }
        });
        return res.status(500).json({success: false, message: "internal server error", details: error.message});
    }
}

export{login};