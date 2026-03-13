import supplier from "../models/supplier.js";

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
        return res.status(200).json({ success: true, message: "Supplier deleted successfully" })
    } catch (error) {
        console.error("Error deleting supplier", error);
        return res.status(500).json({ success: false, message: "server error in deleting supplier" });
    }
}

export { addSupplier, getSuppliers, updateSupplier, deleteSupplier }