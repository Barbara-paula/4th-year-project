import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    getInventoryReport,
    getSalesReport,
    getSupplierReport,
    exportReportPDF,
    exportReportExcel
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/inventory", authMiddleware, getInventoryReport);
router.get("/sales", authMiddleware, getSalesReport);
router.get("/supplier/:id", authMiddleware, getSupplierReport);
router.get("/export/pdf", authMiddleware, exportReportPDF);
router.get("/export/excel", authMiddleware, exportReportExcel);

export default router;
