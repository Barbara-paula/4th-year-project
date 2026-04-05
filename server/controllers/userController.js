import User from "../models/User.js";
import bcrypt from "bcrypt";
import logAction from "../utils/auditService.js";

const addUser = async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;

        const exUser = await User.findOne({ email });
        if (exUser) {
            return res.status(400).json({ success: false, message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            address,
            role,
        })

        await newUser.save();
        await logAction(req.user?._id, req.user?.name, "CREATE", "User", newUser._id, `Created user: ${name} (${role})`, req.ip);
        return res.status(201).json({ success: true, message: "User added successfully" })
    } catch (error) {
        console.error("Error adding new user", error);
        return res.status(500).json({ success: false, message: "server error" });
    }
}

const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        return res.status(200).json({ success: true, users });
    } catch (error) {
        console.error("Error fetching users", error);
        return res.status(500).json({ success: false, message: "server error in getting users" });
    }
}

const getUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error fetching user profile", error);
        return res.status(500).json({ success: false, message: "server error in getting user" });
    }
}

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, email, address, password } = req.body;

        const updatedata = { name, email, address }
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedata.password = hashedPassword;
        }

        const user = await User.findByIdAndUpdate(userId, updatedata, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "user not found" });
        }
        return res.status(200).json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Error updating profile", error);
        return res.status(500).json({ success: false, message: "server error in updating profile" });
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const existingUser = await User.findById(id);
        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        await User.findByIdAndDelete(id);
        await logAction(req.user?._id, req.user?.name, "DELETE", "User", id, `Deleted user: ${existingUser.name}`, req.ip);
        return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user", error);
        return res.status(500).json({ success: false, message: "server error in deleting user" });
    }
}

export { addUser, getUsers, deleteUser, getUser, updateUserProfile };