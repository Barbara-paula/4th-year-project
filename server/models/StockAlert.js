import mongoose from "mongoose";

const stockAlertSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    type: { type: String, enum: ["LOW_STOCK", "OUT_OF_STOCK", "OVERSTOCK"], required: true },
    currentStock: { type: Number, required: true },
    threshold: { type: Number, required: true },
    message: { type: String, required: true },
    isResolved: { type: Boolean, default: false },
    resolvedAt: { type: Date },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

const StockAlertModel = mongoose.model("StockAlert", stockAlertSchema);
export default StockAlertModel;
