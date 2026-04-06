import PurchaseOrderModel from '../models/PurchaseOrder.js';
import ProductModel from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';

// Generate unique order number
const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO${year}${month}${day}${random}`;
};

// Create purchase order
export const createPurchaseOrder = async (req, res) => {
    try {
        const { supplier, items, expectedDeliveryDate, notes } = req.body;

        // Calculate totals
        const subtotal = items.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + tax;

        const purchaseOrder = await PurchaseOrderModel.create({
            orderNumber: generateOrderNumber(),
            supplier,
            items,
            subtotal,
            tax,
            total,
            expectedDeliveryDate,
            notes,
            user: req.user.id
        });

        await purchaseOrder.populate([
            { path: 'supplier', select: 'name email' },
            { path: 'items.product', select: 'name sku' },
            { path: 'user', select: 'name' }
        ]);

        res.status(201).json({ success: true, purchaseOrder });
    } catch (error) {
        console.error("Error creating purchase order:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get all purchase orders
export const getPurchaseOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        
        const purchaseOrders = await PurchaseOrderModel.find(filter)
            .populate('supplier', 'name email')
            .populate('items.product', 'name sku')
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, purchaseOrders });
    } catch (error) {
        console.error("Error fetching purchase orders:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get purchase order by ID
export const getPurchaseOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const purchaseOrder = await PurchaseOrderModel.findById(id)
            .populate('supplier', 'name email phone address')
            .populate('items.product', 'name sku stock')
            .populate('user', 'name email');

        if (!purchaseOrder) {
            return res.status(404).json({ success: false, message: "Purchase order not found" });
        }

        res.status(200).json({ success: true, purchaseOrder });
    } catch (error) {
        console.error("Error fetching purchase order:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Update purchase order status
export const updatePurchaseOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const purchaseOrder = await PurchaseOrderModel.findById(id);
        if (!purchaseOrder) {
            return res.status(404).json({ success: false, message: "Purchase order not found" });
        }

        purchaseOrder.status = status;

        // If order is received, update stock
        if (status === 'RECEIVED') {
            for (const item of purchaseOrder.items) {
                const product = await ProductModel.findById(item.product);
                if (product) {
                    const previousStock = product.stock;
                    product.stock += item.quantity;
                    await product.save();

                    // Create stock movement
                    await StockMovement.create({
                        product: item.product,
                        type: 'IN',
                        quantity: item.quantity,
                        previousStock,
                        newStock: product.stock,
                        reason: `Purchase order ${purchaseOrder.orderNumber} received`,
                        referenceId: purchaseOrder._id,
                        referenceType: 'PurchaseOrder',
                        user: req.user.id
                    });
                }
            }
        }

        await purchaseOrder.save();

        res.status(200).json({ success: true, message: "Purchase order status updated successfully" });
    } catch (error) {
        console.error("Error updating purchase order status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete purchase order
export const deletePurchaseOrder = async (req, res) => {
    try {
        const { id } = req.params;
        
        const purchaseOrder = await PurchaseOrderModel.findById(id);
        if (!purchaseOrder) {
            return res.status(404).json({ success: false, message: "Purchase order not found" });
        }

        if (purchaseOrder.status === 'RECEIVED') {
            return res.status(400).json({ success: false, message: "Cannot delete received purchase order" });
        }

        await PurchaseOrderModel.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: "Purchase order deleted successfully" });
    } catch (error) {
        console.error("Error deleting purchase order:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default {
    createPurchaseOrder,
    getPurchaseOrders,
    getPurchaseOrderById,
    updatePurchaseOrderStatus,
    deletePurchaseOrder
};
