import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String },
    action: {
        type: String,
        enum: ["LOGIN", "CREATE", "UPDATE", "DELETE", "EXPORT"],
        required: true
    },
    entity: {
        type: String,
        enum: ["User", "Product", "Category", "Supplier", "Order", "PurchaseOrder", "StockMovement", "Report"],
        required: true
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: String },
    ipAddress: { type: String },
}, { timestamps: true });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;
