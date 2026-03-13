import Supplier from "../models/supplier.js";
import Category from "../models/category.js";
import Product from "../models/product.js";

const addProduct = async (req, res) => {
    try {
        const { name, description, price, stock, categoryId, supplierId } = req.body;
        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            categoryId,
            supplierId
        });
        await newProduct.save();
        return res.status(200).json({ success: true, message: "Product added successfully" });
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
        const { name, description, price, stock, categoryId, supplierId } = req.body;
        const updatedProduct = await Product.findByIdAndUpdate(id, {
            name,
            description,
            price,
            stock,
            categoryId,
            supplierId
        }, { new: true });
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