import express from 'express';
import {
    createPurchaseOrder,
    getPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrderStatus,
    deletePurchaseOrder
} from '../controllers/purchaseOrderController.js';

const router = express.Router();

router.post('/', createPurchaseOrder);
router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.patch('/:id/status', updatePurchaseOrderStatus);
router.delete('/:id', deletePurchaseOrder);

export default router;
