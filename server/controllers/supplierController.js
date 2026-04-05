import supplier from "../models/Supplier.js";
import PurchaseOrder from "../models/PurchaseOrder.js";
import logAction from "../utils/auditService.js";

const getSupplierPurchaseHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const existingSupplier = await supplier.findById(id);
        if (!existingSupplier) {
            return res.status(404).json({ success: false, message: "Supplier not found" });
        }

        const purchaseOrders = await PurchaseOrder.find({ supplier: id })
            .populate('items.product', 'name sku price')
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, supplier: existingSupplier, purchaseOrders });
    } catch (error) {
        console.error("Error fetching supplier purchase history", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const addSupplier = async (req, res) => {
    try {
        const { name, address, number, email } = req.body;

        const existingSupplier = await supplier.findOne({ name });
        if (existingSupplier) {
            return res.status(400).json({ success: false, message: "supplier already exists" })
        }

        const newSupplier = new supplier({
            name,
            address,
            number,
            email,
        })

        await newSupplier.save();
        await logAction(req.user?._id, req.user?.name, "CREATE", "Supplier", newSupplier._id, `Created supplier: ${name}`, req.ip);
        return res.status(201).json({ success: true, message: "Supplier added successfully" })
    } catch (error) {
        console.error("Error adding new supplier", error);
        return res.status(500).json({ success: false, message: "server error" });
    }
}
const getSuppliers = async (req, res) => {
    try {
        const suppliers = await supplier.find();
        return res.status(200).json({ success: true, suppliers });
    } catch (error) {
        console.error("Error fetching suppliers", error);
        return res.status(500).json({ success: false, message: "server error in getting suppliers" });
    }
}

const updateSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, number, email } = req.body;
        const existingSupplier = await supplier.findById(id);
        if (!existingSupplier) {
            return res.status(404).json({ success: false, message: "supplier not found" })
        }
        const updateSupplier = await supplier.findByIdAndUpdate(id, { name, address, number, email }, { new: true });
        await logAction(req.user?._id, req.user?.name, "UPDATE", "Supplier", id, `Updated supplier: ${name}`, req.ip);
        return res.status(200).json({ success: true, message: "Supplier updated successfully" })
    } catch (error) {
        console.error("Error updating supplier", error);
        return res.status(500).json({ success: false, message: "server error in updating supplier" });
    }
}

const deleteSupplier = async (req, res) => {
    try {
        const { id } = req.params;
        const existingSupplier = await supplier.findById(id);
        if (!existingSupplier) {
            return res.status(404).json({ success: false, message: "supplier not found" })
        }
        await supplier.findByIdAndDelete(id);
        await logAction(req.user?._id, req.user?.name, "DELETE", "Supplier", id, `Deleted supplier: ${existingSupplier.name}`, req.ip);
        return res.status(200).json({ success: true, message: "Supplier deleted successfully" })
    } catch (error) {
        console.error("Error deleting supplier", error);
        return res.status(500).json({ success: false, message: "server error in deleting supplier" });
    }
}

export { addSupplier, getSuppliers, updateSupplier, deleteSupplier, getSupplierPurchaseHistory }