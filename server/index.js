import express from 'express';
import cors from 'cors';
import connectDB from './db/connection.js';
import authRoutes from './routes/auth.js'
import categoryRoutes from "./routes/category.js";
import supplierRoutes from "./routes/supplier.js";
import productRoutes from "./routes/product.js";
import userRoutes from "./routes/user.js";
import orderRouter from "./routes/order.js";
import dashboardRouter from "./routes/dashboard.js";
import stockRoutes from "./routes/stock.js";
import purchaseOrderRoutes from "./routes/purchaseOrder.js";
import auditRoutes from "./routes/audit.js";
import reportRoutes from "./routes/report.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use("/api/category", categoryRoutes)
app.use("/api/supplier", supplierRoutes)
app.use("/api/product", productRoutes)
app.use("/api/user", userRoutes)
app.use("/api/order", orderRouter)
app.use("/api/dashboard", dashboardRouter)
app.use("/api/stock", stockRoutes)
app.use("/api/purchase-order", purchaseOrderRoutes)
app.use("/api/audit", auditRoutes)
app.use("/api/report", reportRoutes)

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${PORT}`);
})