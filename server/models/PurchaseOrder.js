import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema({
    orderNumber: { type: String, unique: true, required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        unitCost: { type: Number, required: true },
        total: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ["PENDING", "CONFIRMED", "PARTIAL", "RECEIVED", "CANCELLED"], default: "PENDING" },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    notes: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const PurchaseOrderModel = mongoose.model("PurchaseOrder", purchaseOrderSchema);
export default PurchaseOrderModel;
