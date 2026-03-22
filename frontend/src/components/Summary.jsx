import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaBox, FaWarehouse, FaShoppingCart, FaDollarSign, FaExclamationTriangle, FaChartLine, FaSpinner } from "react-icons/fa";

const Summary = () => {
    const [dashboardData, setDashboardData] = useState({
        totalProducts: 0,
        totalStock: 0,
        ordersToday: 0,
        revenue: 0,
        outOfStock: [],
        highestSaleProduct: null,
        lowStock: []
    });
    const [loading, setLoading] = useState(false);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://stockflow-backend-tq0g.onrender.com/api/dashboard', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('pos-token')}`
                }
            });
            setDashboardData(response.data.dashboardData);
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const StatCard = ({ title, value, icon, color, gradient }) => (
        <div className={`${gradient} text-white p-6 rounded-2xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium opacity-90">{title}</p>
                    <p className="text-3xl font-bold mt-2">{value}</p>
                </div>
                <div className={`${color} p-3 rounded-full bg-white bg-opacity-20`}>
                    {icon}
                </div>
            </div>
        </div>
    );

    const InfoCard = ({ title, children, icon, type = "default" }) => {
        const bgColor = type === "warning" ? "bg-red-50 border-red-200" : 
                       type === "success" ? "bg-green-50 border-green-200" : 
                       "bg-blue-50 border-blue-200";
        
        return (
            <div className={`${bgColor} border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}>
                <div className="flex items-center mb-4">
                    {icon}
                    <h3 className="text-lg font-semibold text-gray-800 ml-2">{title}</h3>
                </div>
                {children}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
                <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back! Here's what's happening with your inventory today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Products"
                    value={dashboardData.totalProducts}
                    icon={<FaBox className="text-2xl" />}
                    color="text-blue-600"
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Total Stock"
                    value={dashboardData.totalStock}
                    icon={<FaWarehouse className="text-2xl" />}
                    color="text-green-600"
                    gradient="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard
                    title="Orders Today"
                    value={dashboardData.ordersToday}
                    icon={<FaShoppingCart className="text-2xl" />}
                    color="text-yellow-600"
                    gradient="bg-gradient-to-br from-yellow-500 to-yellow-600"
                />
                <StatCard
                    title="Revenue"
                    value={`$${dashboardData.revenue}`}
                    icon={<FaDollarSign className="text-2xl" />}
                    color="text-purple-600"
                    gradient="bg-gradient-to-br from-purple-500 to-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <InfoCard 
                    title="Out of Stock Products" 
                    icon={<FaExclamationTriangle className="text-red-500 text-xl" />}
                    type="warning"
                >
                    {dashboardData.outOfStock?.length > 0 ? (
                        <ul className="space-y-3">
                            {dashboardData.outOfStock.map((product, index) => (
                                <li key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                                    <div>
                                        <span className="font-medium text-gray-800">{product.name}</span>
                                        <span className="text-sm text-gray-500 ml-2">
                                            ({product.categoryId?.categoryName ?? "No category"})
                                        </span>
                                    </div>
                                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                                        Out of Stock
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-green-500 text-4xl mb-2">✓</div>
                            <p className="text-gray-600">All products are in stock</p>
                        </div>
                    )}
                </InfoCard>

                <InfoCard 
                    title="Highest Sale Product" 
                    icon={<FaChartLine className="text-green-500 text-xl" />}
                    type="success"
                >
                    {dashboardData.highestSaleProduct?.name ? (
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                            <div className="mb-3">
                                <p className="text-xl font-bold text-gray-800">{dashboardData.highestSaleProduct.name}</p>
                                <p className="text-sm text-gray-500">{dashboardData.highestSaleProduct.category}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Units Sold:</span>
                                <span className="text-lg font-bold text-green-600">{dashboardData.highestSaleProduct.totalQuantity}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FaChartLine className="text-gray-400 text-4xl mx-auto mb-2" />
                            <p className="text-gray-600">{dashboardData.highestSaleProduct?.message || 'No sales data available'}</p>
                        </div>
                    )}
                </InfoCard>

                <InfoCard 
                    title="Low Stock Products" 
                    icon={<FaExclamationTriangle className="text-yellow-500 text-xl" />}
                    type="default"
                >
                    {dashboardData.lowStock?.length > 0 ? (
                        <ul className="space-y-3 max-h-64 overflow-y-auto">
                            {dashboardData.lowStock.map((product, index) => (
                                <li key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-yellow-200">
                                    <div>
                                        <span className="font-medium text-gray-800">{product.name}</span>
                                        <span className="text-sm text-gray-500 ml-2">
                                            ({product.categoryId?.categoryName ?? "No category"})
                                        </span>
                                    </div>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                                        {product.stock} left
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-green-500 text-4xl mb-2">✓</div>
                            <p className="text-gray-600">No low stock products</p>
                        </div>
                    )}
                </InfoCard>
            </div>
        </div>
    );
};

export default Summary;