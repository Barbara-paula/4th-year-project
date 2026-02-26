import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", authMiddleware,);
//router.delete("/delete/:id", authMiddleware, deleteCategory);
//router.get("/get", authMiddleware, getCategories);
//router.put("/update/:id", authMiddleware, updateCategory);

export default router;
