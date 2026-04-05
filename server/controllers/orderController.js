import Product from "../models/Product.js";
import Order from "../models/Order.js";
import logAction from "../utils/auditService.js";

const addOrder = async (req, res) => {
    try {
        const { product_id, quantity, total } = req.body;
        const userId = req.user._id;
        const product = await Product.findById({ _id: product_id });
        if (!product) {
            return res.status(404).json({ error: "Product not found in order" });
        }
        if (quantity > product.stock) {
            return res.status(400).json({ error: "Not enough stock" });
        } else {
            product.stock -= parseInt(quantity);
            await product.save();
        }
        const orderObj = new Order({
            customer: userId,
            product: product_id,
            quantity,
            totalPrice: total,
        });
        await orderObj.save();
        await logAction(userId, req.user?.name, "CREATE", "Order", orderObj._id, `Created order for product ${product.name}, qty: ${quantity}`, req.ip);
        return res.status(200).json({ success: true, message: "Order added successfully" });
    } catch (error) {
        console.log("Error adding order:", error);
        return res.status(500).json({ success: false, error: "Error adding order" });
    }
}

const getOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        let query = {};
        if (req.user.role === "customer") {
            query = { customer: userId }
        }
        const orders = await Order.find(query).populate({
            path: "product", populate:
            {
                path: "categoryId",
                select: "categoryName"
            }, select: "name price"
        }).populate("customer", "name email");
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, error: "Error getting orders" });
    }
}

export { addOrder, getOrders };
