import fs from 'fs';

async function test() {
    try {
        const { deleteCategory } = await import("./controllers/categoryController.js");
        const mongoose = await import("mongoose");
        await mongoose.default.connect("mongodb://127.0.0.1:27017/stockflow");

        let responseSent = false;
        const req = { params: { id: "69d27feb685ea7afac541403" } };
        const res = {
            status: (code) => {
                res.statusCode = code;
                return res;
            },
            json: (data) => {
                const out = `Status: ${res.statusCode}, Data: ${JSON.stringify(data)}`;
                fs.writeFileSync('clean-error.txt', out, 'utf8');
                responseSent = true;
            }
        };

        try {
            await deleteCategory(req, res);
            if (!responseSent) {
                fs.writeFileSync('clean-error.txt', "No response sent?", 'utf8');
            }
        } catch(e) {
            fs.writeFileSync('clean-error.txt', "Execution error: " + (e.stack || e.toString()), 'utf8');
        }
        process.exit(0);
    } catch(err) {
        fs.writeFileSync('clean-error.txt', "Import error: " + (err.stack || err.toString()), 'utf8');
        process.exit(1);
    }
}
test();
