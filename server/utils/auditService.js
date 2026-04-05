import AuditLog from "../models/AuditLog.js";

const logAction = async (userId, userName, action, entity, entityId, details, ipAddress) => {
    try {
        await AuditLog.create({
            user: userId,
            userName: userName || "System",
            action,
            entity,
            entityId,
            details,
            ipAddress
        });
    } catch (error) {
        console.error("Error creating audit log:", error);
    }
};

export default logAction;
