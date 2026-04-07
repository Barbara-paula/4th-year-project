import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import {
    createPurchaseOrder,
    getPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrderStatus,
    deletePurchaseOrder
} from '../controllers/purchaseOrderController.js';

const router = express.Router();

router.post('/', authMiddleware, createPurchaseOrder);
router.get('/', authMiddleware, getPurchaseOrders);
router.get('/:id', authMiddleware, getPurchaseOrderById);
router.patch('/:id/status', authMiddleware, updatePurchaseOrderStatus);
router.delete('/:id', authMiddleware, deletePurchaseOrder);

export default router;
