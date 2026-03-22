import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import StockAlert from '../models/StockAlert.js';

// Get low stock products
export const getLowStockProducts = async (req, res) => {
    try {
        const lowStockProducts = await Product.find({
            $expr: { $lte: ['$stock', '$minStockThreshold'] },
            isDeleted: false
        }).populate('categoryId supplierId');

        // Create alerts for low stock
        for (const product of lowStockProducts) {
            const existingAlert = await StockAlert.findOne({
                product: product._id,
                type: 'LOW_STOCK',
                isResolved: false
            });

            if (!existingAlert) {
                await StockAlert.create({
                    product: product._id,
                    type: 'LOW_STOCK',
                    currentStock: product.stock,
                    threshold: product.minStockThreshold,
                    message: `${product.name} is running low on stock (${product.stock} remaining)`
                });
            }
        }

        res.status(200).json({ success: true, lowStockProducts });
    } catch (error) {
        console.error("Error fetching low stock products:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get stock movement history
export const getStockMovements = async (req, res) => {
    try {
        const { productId } = req.query;
        const filter = productId ? { product: productId } : {};
        
        const movements = await StockMovement.find(filter)
            .populate('product', 'name sku')
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, movements });
    } catch (error) {
        console.error("Error fetching stock movements:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get stock alerts
export const getStockAlerts = async (req, res) => {
    try {
        const alerts = await StockAlert.find({ isResolved: false })
            .populate('product', 'name sku stock')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, alerts });
    } catch (error) {
        console.error("Error fetching stock alerts:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Resolve stock alert
export const resolveStockAlert = async (req, res) => {
    try {
        const { alertId } = req.params;
        const alert = await StockAlert.findByIdAndUpdate(
            alertId,
            { 
                isResolved: true, 
                resolvedAt: new Date(),
                resolvedBy: req.user.id 
            },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({ success: false, message: "Alert not found" });
        }

        res.status(200).json({ success: true, message: "Alert resolved successfully" });
    } catch (error) {
        console.error("Error resolving stock alert:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Update stock with movement tracking
export const updateStock = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, type, reason } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const previousStock = product.stock;
        let newStock;

        if (type === 'IN') {
            newStock = previousStock + quantity;
        } else if (type === 'OUT') {
            if (previousStock < quantity) {
                return res.status(400).json({ success: false, message: "Insufficient stock" });
            }
            newStock = previousStock - quantity;
        } else if (type === 'ADJUSTMENT') {
            newStock = quantity;
        }

        product.stock = newStock;
        await product.save();

        // Create stock movement record
        await StockMovement.create({
            product: productId,
            type,
            quantity,
            previousStock,
            newStock,
            reason,
            user: req.user.id
        });

        // Check for stock alerts
        if (newStock <= product.minStockThreshold) {
            await StockAlert.create({
                product: productId,
                type: newStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
                currentStock: newStock,
                threshold: product.minStockThreshold,
                message: `${product.name} stock updated to ${newStock} (threshold: ${product.minStockThreshold})`
            });
        }

        res.status(200).json({ 
            success: true, 
            message: "Stock updated successfully", 
            product: { ...product.toObject(), previousStock }
        });
    } catch (error) {
        console.error("Error updating stock:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export default {
    getLowStockProducts,
    getStockMovements,
    getStockAlerts,
    resolveStockAlert,
    updateStock
};
