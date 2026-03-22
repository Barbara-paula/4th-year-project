import Supplier from "../models/Supplier.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

// Generate SKU
const generateSKU = (name, categoryId) => {
    const nameCode = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 3);
    const categoryCode = categoryId.toString().substring(0, 3);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${nameCode}${categoryCode}${random}`;
};

// Generate Barcode
const generateBarcode = () => {
    return Math.floor(Math.random() * 10000000000).toString();
};

const addProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, supplierId, minStockThreshold, maxStockThreshold } = req.body;
        
        // Generate SKU and Barcode
        const sku = generateSKU(name, categoryId);
        const barcode = generateBarcode();
        
        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            categoryId,
            supplierId,
            minStockThreshold: minStockThreshold || 10,
            maxStockThreshold: maxStockThreshold || 100,
            sku,
            barcode
        });
        await newProduct.save();
        return res.status(200).json({ success: true, message: "Product added successfully", product: newProduct });
    } catch (error) {
        console.error("Error adding product", error);
        return res.status(500).json({ success: false, message: "server error in adding product" });
    }
}

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false }).populate("categoryId").populate("supplierId");
        const suppliers = await Supplier.find();
        const categories = await Category.find();
        return res.status(200).json({ success: true, products, suppliers, categories });
    } catch (error) {
        console.error("Error fetching suppliers", error);
        return res.status(500).json({ success: false, message: "server error in getting suppliers" });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, stock, categoryId, supplierId, minStockThreshold, maxStockThreshold } = req.body;
        const updateData = {
            name,
            description,
            price,
            stock,
            categoryId,
            supplierId
        };
        
        if (minStockThreshold !== undefined) updateData.minStockThreshold = minStockThreshold;
        if (maxStockThreshold !== undefined) updateData.maxStockThreshold = maxStockThreshold;
        
        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedProduct) {
            return res.status(400).json({ success: false, message: "Product not found" });
        }
        return res.status(200).json({ success: true, message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        console.error("Error updating product", error);
        return res.status(500).json({ success: false, message: "server error in updating product" });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(400).json({ success: false, message: "Product not found" });
        }
        if (existingProduct.isDeleted) {
            return res.status(400).json({ success: false, message: "Product already deleted" });
        }
        await Product.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        return res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product", error);
        return res.status(500).json({ success: false, message: "server error in deleting product" });
    }
}
export { getProducts, addProduct, updateProduct, deleteProduct };