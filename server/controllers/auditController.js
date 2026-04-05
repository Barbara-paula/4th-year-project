import AuditLog from "../models/AuditLog.js";

const getAuditLogs = async (req, res) => {
    try {
        const { action, entity, userId, startDate, endDate, page = 1, limit = 50 } = req.query;

        const filter = {};
        if (action) filter.action = action;
        if (entity) filter.entity = entity;
        if (userId) filter.user = userId;
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) filter.createdAt.$gte = new Date(startDate);
            if (endDate) filter.createdAt.$lte = new Date(endDate + "T23:59:59.999Z");
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await AuditLog.countDocuments(filter);
        const logs = await AuditLog.find(filter)
            .populate("user", "name email role")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        return res.status(200).json({
            success: true,
            logs,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            totalLogs: total
        });
    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export { getAuditLogs };
