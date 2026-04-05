import Product from "../models/Product.js";
import Order from "../models/Order.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import Supplier from "../models/Supplier.js";
import Category from "../models/Category.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

// Inventory Report
const getInventoryReport = async (req, res) => {
    try {
        const { categoryId, supplierId, startDate, endDate } = req.query;

        const filter = { isDeleted: false };
        if (categoryId) filter.categoryId = categoryId;
        if (supplierId) filter.supplierId = supplierId;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate + "T23:59:59.999Z");
        }

        const products = await Product.find(filter)
            .populate("categoryId", "categoryName")
            .populate("supplierId", "name")
            .sort({ name: 1 });

        const totalProducts = products.length;
        const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        const lowStockCount = products.filter(p => p.stock <= p.minStockThreshold).length;
        const outOfStockCount = products.filter(p => p.stock === 0).length;

        return res.status(200).json({
            success: true,
            report: {
                products,
                summary: { totalProducts, totalStock, totalValue, lowStockCount, outOfStockCount }
            }
        });
    } catch (error) {
        console.error("Error generating inventory report:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Sales Report
const getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate, categoryId } = req.query;

        const filter = {};
        if (startDate || endDate) {
            filter.orderDate = {};
            if (startDate) filter.orderDate.$gte = new Date(startDate);
            if (endDate) filter.orderDate.$lte = new Date(endDate + "T23:59:59.999Z");
        }

        let orders = await Order.find(filter)
            .populate({
                path: "product",
                populate: { path: "categoryId", select: "categoryName" },
                select: "name price categoryId"
            })
            .populate("customer", "name email")
            .sort({ orderDate: -1 });

        if (categoryId) {
            orders = orders.filter(o => o.product?.categoryId?._id?.toString() === categoryId);
        }

        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const totalQuantity = orders.reduce((sum, o) => sum + (o.quantity || 0), 0);

        return res.status(200).json({
            success: true,
            report: {
                orders,
                summary: { totalOrders, totalRevenue, totalQuantity }
            }
        });
    } catch (error) {
        console.error("Error generating sales report:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Supplier Report
const getSupplierReport = async (req, res) => {
    try {
        const { id } = req.params;

        const supplier = await Supplier.findById(id);
        if (!supplier) {
            return res.status(404).json({ success: false, message: "Supplier not found" });
        }

        const purchaseOrders = await PurchaseOrder.find({ supplier: id })
            .populate("items.product", "name sku price")
            .populate("user", "name")
            .sort({ createdAt: -1 });

        const totalOrders = purchaseOrders.length;
        const totalSpent = purchaseOrders.reduce((sum, po) => sum + (po.total || 0), 0);
        const receivedOrders = purchaseOrders.filter(po => po.status === "RECEIVED").length;
        const pendingOrders = purchaseOrders.filter(po => po.status === "PENDING").length;

        return res.status(200).json({
            success: true,
            report: {
                supplier,
                purchaseOrders,
                summary: { totalOrders, totalSpent, receivedOrders, pendingOrders }
            }
        });
    } catch (error) {
        console.error("Error generating supplier report:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Export Inventory Report to PDF
const exportReportPDF = async (req, res) => {
    try {
        const { type, categoryId, supplierId, startDate, endDate } = req.query;

        const doc = new PDFDocument({ margin: 40, size: "A4" });
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=${type || "inventory"}_report.pdf`);
        doc.pipe(res);

        doc.fontSize(20).text("Inventory Management System", { align: "center" });
        doc.moveDown(0.5);
        doc.fontSize(14).text(`${(type || "inventory").charAt(0).toUpperCase() + (type || "inventory").slice(1)} Report`, { align: "center" });
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
        doc.moveDown();

        if (type === "sales") {
            const filter = {};
            if (startDate || endDate) {
                filter.orderDate = {};
                if (startDate) filter.orderDate.$gte = new Date(startDate);
                if (endDate) filter.orderDate.$lte = new Date(endDate + "T23:59:59.999Z");
            }

            const orders = await Order.find(filter)
                .populate({ path: "product", select: "name price" })
                .populate("customer", "name")
                .sort({ orderDate: -1 });

            const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
            doc.fontSize(12).text(`Total Orders: ${orders.length}`);
            doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`);
            doc.moveDown();

            // Table header
            doc.fontSize(10).font("Helvetica-Bold");
            doc.text("Product", 40, doc.y, { continued: true, width: 150 });
            doc.text("Customer", 200, doc.y, { continued: true, width: 120 });
            doc.text("Qty", 330, doc.y, { continued: true, width: 60 });
            doc.text("Total", 400, doc.y, { width: 80 });
            doc.moveDown(0.5);
            doc.font("Helvetica");

            orders.forEach((order) => {
                const y = doc.y;
                if (y > 750) { doc.addPage(); }
                doc.text(order.product?.name || "N/A", 40, doc.y, { continued: true, width: 150 });
                doc.text(order.customer?.name || "N/A", 200, doc.y, { continued: true, width: 120 });
                doc.text(String(order.quantity || 0), 330, doc.y, { continued: true, width: 60 });
                doc.text(`$${(order.totalPrice || 0).toFixed(2)}`, 400, doc.y, { width: 80 });
            });
        } else {
            const filter = { isDeleted: false };
            if (categoryId) filter.categoryId = categoryId;
            if (supplierId) filter.supplierId = supplierId;
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate) filter.createdAt.$gte = new Date(startDate);
                if (endDate) filter.createdAt.$lte = new Date(endDate + "T23:59:59.999Z");
            }

            const products = await Product.find(filter)
                .populate("categoryId", "categoryName")
                .populate("supplierId", "name");

            const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
            doc.fontSize(12).text(`Total Products: ${products.length}`);
            doc.text(`Total Stock Value: $${totalValue.toFixed(2)}`);
            doc.moveDown();

            doc.fontSize(10).font("Helvetica-Bold");
            doc.text("Product", 40, doc.y, { continued: true, width: 120 });
            doc.text("Category", 170, doc.y, { continued: true, width: 100 });
            doc.text("Stock", 280, doc.y, { continued: true, width: 60 });
            doc.text("Price", 350, doc.y, { continued: true, width: 70 });
            doc.text("Value", 430, doc.y, { width: 80 });
            doc.moveDown(0.5);
            doc.font("Helvetica");

            products.forEach((product) => {
                const y = doc.y;
                if (y > 750) { doc.addPage(); }
                doc.text(product.name, 40, doc.y, { continued: true, width: 120 });
                doc.text(product.categoryId?.categoryName || "N/A", 170, doc.y, { continued: true, width: 100 });
                doc.text(String(product.stock), 280, doc.y, { continued: true, width: 60 });
                doc.text(`$${product.price.toFixed(2)}`, 350, doc.y, { continued: true, width: 70 });
                doc.text(`$${(product.price * product.stock).toFixed(2)}`, 430, doc.y, { width: 80 });
            });
        }

        doc.end();
    } catch (error) {
        console.error("Error exporting PDF:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// Export Inventory Report to Excel
const exportReportExcel = async (req, res) => {
    try {
        const { type, categoryId, supplierId, startDate, endDate } = req.query;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Inventory Management System";

        if (type === "sales") {
            const sheet = workbook.addWorksheet("Sales Report");
            sheet.columns = [
                { header: "Order Date", key: "date", width: 15 },
                { header: "Product", key: "product", width: 25 },
                { header: "Customer", key: "customer", width: 20 },
                { header: "Quantity", key: "quantity", width: 12 },
                { header: "Total Price", key: "totalPrice", width: 15 }
            ];

            // Style header row
            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
            sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

            const filter = {};
            if (startDate || endDate) {
                filter.orderDate = {};
                if (startDate) filter.orderDate.$gte = new Date(startDate);
                if (endDate) filter.orderDate.$lte = new Date(endDate + "T23:59:59.999Z");
            }

            const orders = await Order.find(filter)
                .populate({ path: "product", select: "name price" })
                .populate("customer", "name")
                .sort({ orderDate: -1 });

            orders.forEach((order) => {
                sheet.addRow({
                    date: order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A",
                    product: order.product?.name || "N/A",
                    customer: order.customer?.name || "N/A",
                    quantity: order.quantity || 0,
                    totalPrice: order.totalPrice || 0
                });
            });

            // Summary row
            const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
            sheet.addRow({});
            sheet.addRow({ product: "TOTAL", quantity: orders.reduce((s, o) => s + (o.quantity || 0), 0), totalPrice: totalRevenue });
        } else {
            const sheet = workbook.addWorksheet("Inventory Report");
            sheet.columns = [
                { header: "Product Name", key: "name", width: 25 },
                { header: "SKU", key: "sku", width: 15 },
                { header: "Category", key: "category", width: 20 },
                { header: "Supplier", key: "supplier", width: 20 },
                { header: "Stock", key: "stock", width: 10 },
                { header: "Price", key: "price", width: 12 },
                { header: "Value", key: "value", width: 15 },
                { header: "Status", key: "status", width: 15 }
            ];

            sheet.getRow(1).font = { bold: true };
            sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };
            sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };

            const filter = { isDeleted: false };
            if (categoryId) filter.categoryId = categoryId;
            if (supplierId) filter.supplierId = supplierId;
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate) filter.createdAt.$gte = new Date(startDate);
                if (endDate) filter.createdAt.$lte = new Date(endDate + "T23:59:59.999Z");
            }

            const products = await Product.find(filter)
                .populate("categoryId", "categoryName")
                .populate("supplierId", "name");

            products.forEach((product) => {
                const status = product.stock === 0 ? "Out of Stock" :
                    product.stock <= product.minStockThreshold ? "Low Stock" : "In Stock";
                sheet.addRow({
                    name: product.name,
                    sku: product.sku || "N/A",
                    category: product.categoryId?.categoryName || "N/A",
                    supplier: product.supplierId?.name || "N/A",
                    stock: product.stock,
                    price: product.price,
                    value: product.price * product.stock,
                    status
                });
            });

            const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
            sheet.addRow({});
            sheet.addRow({ name: "TOTAL", stock: products.reduce((s, p) => s + p.stock, 0), value: totalValue });
        }

        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", `attachment; filename=${type || "inventory"}_report.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Error exporting Excel:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export { getInventoryReport, getSalesReport, getSupplierReport, exportReportPDF, exportReportExcel };
