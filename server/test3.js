import mongoose from "mongoose";
import { addCategory, deleteCategory } from "./controllers/categoryController.js";
import Category from "./models/Category.js";

async function run() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/stockflow");

        const reqAdd = { body: { categoryName: "Test Category", categoryDescription: "Test Desc" } };
        let addedId = null;
        let responseStatus = null;
        let responseData = null;

        const resAdd = {
            status: (code) => { responseStatus = code; return resAdd; },
            json: (data) => { responseData = data; }
        };

        await addCategory(reqAdd, resAdd);
        console.log("Add response:", responseStatus, responseData);

        const newCat = await Category.findOne({ categoryName: "Test Category" });
        if (!newCat) {
            console.log("Failed to insert");
            process.exit(1);
        }
        addedId = newCat._id.toString();
        console.log("Inserted category ID:", addedId);

        const reqDel = { params: { id: addedId } };
        const resDel = {
            status: (code) => { responseStatus = code; return resDel; },
            json: (data) => { responseData = data; }
        };

        await deleteCategory(reqDel, resDel);
        console.log("Delete response:", responseStatus, responseData);

        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}

run();
