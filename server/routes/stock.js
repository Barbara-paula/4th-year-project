import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    getLowStockProducts,
    getStockMovements,
    getStockAlerts,
    resolveStockAlert,
    updateStock
} from '../controllers/stockController.js';

const router = express.Router();

router.get('/low-stock', authMiddleware, getLowStockProducts);
router.get('/movements', authMiddleware, getStockMovements);
router.get('/alerts', authMiddleware, getStockAlerts);
router.patch('/alerts/:alertId/resolve', authMiddleware, resolveStockAlert);
router.patch('/products/:productId/update-stock', authMiddleware, updateStock);

export default router;
