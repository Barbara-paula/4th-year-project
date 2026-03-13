import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { addSupplier, getSuppliers, updateSupplier, deleteSupplier } from "../controllers/supplierController.js";

const router = express.Router();

router.post("/add", authMiddleware, addSupplier);
router.delete("/:id", authMiddleware, deleteSupplier);
router.get("/", authMiddleware, getSuppliers);
router.put("/:id", authMiddleware, updateSupplier);

export default router;
