import mongoose from "mongoose";

const stockMovementSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["IN", "OUT", "ADJUSTMENT"], required: true },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String, required: true },
    referenceId: { type: mongoose.Schema.Types.ObjectId }, // Order ID, Purchase Order ID, etc.
    referenceType: { type: String }, // "Order", "PurchaseOrder", "Adjustment"
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

const StockMovementModel = mongoose.model("StockMovement", stockMovementSchema);
export default StockMovementModel;
