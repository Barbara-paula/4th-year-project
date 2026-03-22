import express from 'express';
import {
    getLowStockProducts,
    getStockMovements,
    getStockAlerts,
    resolveStockAlert,
    updateStock
} from '../controllers/stockController.js';

const router = express.Router();

router.get('/low-stock', getLowStockProducts);
router.get('/movements', getStockMovements);
router.get('/alerts', getStockAlerts);
router.patch('/alerts/:alertId/resolve', resolveStockAlert);
router.patch('/products/:productId/update-stock', updateStock);

export default router;
