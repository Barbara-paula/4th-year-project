import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaFileAlt, FaFilePdf, FaFileExcel, FaSearch, FaSpinner, FaChartBar, FaShoppingCart, FaTruck } from 'react-icons/fa';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        categoryId: '',
        supplierId: ''
    });

    const API_BASE = "https://stockflow-backend-tq0g.onrender.com/api";

    useEffect(() => {
        fetchDropdownData();
    }, []);

    const fetchDropdownData = async () => {
        try {
            const response = await axios.get(`${API_BASE}/product`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('pos-token')}` }
            });
            if (response.data.success) {
                setCategories(response.data.categories || []);
                setSuppliers(response.data.suppliers || []);
            }
        } catch (error) {
            console.error("Error fetching dropdown data:", error);
        }
    };

    const fetchReport = async () => {
        setLoading(true);
        setReportData(null);
        try {
            const params = new URLSearchParams();
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            let url = '';
            if (activeTab === 'inventory') {
                url = `${API_BASE}/report/inventory`;
                if (filters.categoryId) params.append('categoryId', filters.categoryId);
                if (filters.supplierId) params.append('supplierId', filters.supplierId);
            } else if (activeTab === 'sales') {
                url = `${API_BASE}/report/sales`;
                if (filters.categoryId) params.append('categoryId', filters.categoryId);
            } else if (activeTab === 'supplier') {
                if (!filters.supplierId) {
                    alert('Please select a supplier for the supplier report.');
                    setLoading(false);
                    return;
                }
                url = `${API_BASE}/report/supplier/${filters.supplierId}`;
            }

            const response = await axios.get(`${url}?${params.toString()}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('pos-token')}` }
            });
            if (response.data.success) {
                setReportData(response.data.report);
            }
        } catch (error) {
            console.error("Error fetching report:", error);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format) => {
        try {
            const params = new URLSearchParams();
            params.append('type', activeTab);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            if (filters.categoryId) params.append('categoryId', filters.categoryId);
            if (filters.supplierId) params.append('supplierId', filters.supplierId);

            const response = await axios.get(`${API_BASE}/report/export/${format}?${params.toString()}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('pos-token')}` },
                responseType: 'blob'
            });

            const ext = format === 'pdf' ? 'pdf' : 'xlsx';
            const blob = new Blob([response.data]);
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${activeTab}_report.${ext}`;
            link.click();
            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error(`Error exporting ${format}:`, error);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const tabs = [
        { id: 'inventory', label: 'Inventory Report', icon: <FaChartBar /> },
        { id: 'sales', label: 'Sales Report', icon: <FaShoppingCart /> },
        { id: 'supplier', label: 'Supplier Report', icon: <FaTruck /> }
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports</h1>
                <p className="text-gray-600">Generate and export inventory, sales, and supplier reports</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setActiveTab(tab.id); setReportData(null); }}
                        className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                            activeTab === tab.id
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                        }`}
                    >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    {(activeTab === 'inventory' || activeTab === 'sales') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                            <select
                                name="categoryId"
                                value={filters.categoryId}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.categoryName}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    {(activeTab === 'inventory' || activeTab === 'supplier') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Supplier</label>
                            <select
                                name="supplierId"
                                value={filters.supplierId}
                                onChange={handleFilterChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Suppliers</option>
                                {suppliers.map(sup => (
                                    <option key={sup._id} value={sup._id}>{sup.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <div className="flex space-x-3 mt-4">
                    <button
                        onClick={fetchReport}
                        disabled={loading}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center"
                    >
                        {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSearch className="mr-2" />}
                        Generate Report
                    </button>
                    <button
                        onClick={() => exportReport('pdf')}
                        disabled={!reportData}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center disabled:opacity-50"
                    >
                        <FaFilePdf className="mr-2" /> Export PDF
                    </button>
                    <button
                        onClick={() => exportReport('excel')}
                        disabled={!reportData}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center disabled:opacity-50"
                    >
                        <FaFileExcel className="mr-2" /> Export Excel
                    </button>
                </div>
            </div>

            {/* Report Data */}
            {loading && (
                <div className="flex items-center justify-center h-40">
                    <FaSpinner className="animate-spin text-4xl text-blue-500" />
                    <span className="ml-3 text-lg text-gray-600">Generating report...</span>
                </div>
            )}

            {reportData && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {activeTab === 'inventory' && (
                            <>
                                <SummaryCard label="Total Products" value={reportData.summary.totalProducts} color="blue" />
                                <SummaryCard label="Total Stock" value={reportData.summary.totalStock} color="green" />
                                <SummaryCard label="Stock Value" value={`$${reportData.summary.totalValue.toFixed(2)}`} color="purple" />
                                <SummaryCard label="Low Stock" value={reportData.summary.lowStockCount} color="red" />
                            </>
                        )}
                        {activeTab === 'sales' && (
                            <>
                                <SummaryCard label="Total Orders" value={reportData.summary.totalOrders} color="blue" />
                                <SummaryCard label="Total Revenue" value={`$${reportData.summary.totalRevenue.toFixed(2)}`} color="green" />
                                <SummaryCard label="Items Sold" value={reportData.summary.totalQuantity} color="purple" />
                            </>
                        )}
                        {activeTab === 'supplier' && (
                            <>
                                <SummaryCard label="Total Orders" value={reportData.summary.totalOrders} color="blue" />
                                <SummaryCard label="Total Spent" value={`$${reportData.summary.totalSpent.toFixed(2)}`} color="green" />
                                <SummaryCard label="Received" value={reportData.summary.receivedOrders} color="purple" />
                                <SummaryCard label="Pending" value={reportData.summary.pendingOrders} color="yellow" />
                            </>
                        )}
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto">
                        {activeTab === 'inventory' && (
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 p-2 text-left">Product</th>
                                        <th className="border border-gray-300 p-2 text-left">SKU</th>
                                        <th className="border border-gray-300 p-2 text-left">Category</th>
                                        <th className="border border-gray-300 p-2 text-left">Supplier</th>
                                        <th className="border border-gray-300 p-2 text-right">Stock</th>
                                        <th className="border border-gray-300 p-2 text-right">Price</th>
                                        <th className="border border-gray-300 p-2 text-right">Value</th>
                                        <th className="border border-gray-300 p-2 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.products.map(product => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 p-2">{product.name}</td>
                                            <td className="border border-gray-300 p-2">{product.sku || 'N/A'}</td>
                                            <td className="border border-gray-300 p-2">{product.categoryId?.categoryName || 'N/A'}</td>
                                            <td className="border border-gray-300 p-2">{product.supplierId?.name || 'N/A'}</td>
                                            <td className="border border-gray-300 p-2 text-right">{product.stock}</td>
                                            <td className="border border-gray-300 p-2 text-right">${product.price.toFixed(2)}</td>
                                            <td className="border border-gray-300 p-2 text-right">${(product.price * product.stock).toFixed(2)}</td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    product.stock === 0 ? 'bg-red-100 text-red-700' :
                                                    product.stock <= product.minStockThreshold ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {product.stock === 0 ? 'Out of Stock' :
                                                     product.stock <= product.minStockThreshold ? 'Low Stock' : 'In Stock'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'sales' && (
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 p-2 text-left">Date</th>
                                        <th className="border border-gray-300 p-2 text-left">Product</th>
                                        <th className="border border-gray-300 p-2 text-left">Customer</th>
                                        <th className="border border-gray-300 p-2 text-left">Category</th>
                                        <th className="border border-gray-300 p-2 text-right">Quantity</th>
                                        <th className="border border-gray-300 p-2 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.orders.map(order => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 p-2">{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</td>
                                            <td className="border border-gray-300 p-2">{order.product?.name || 'N/A'}</td>
                                            <td className="border border-gray-300 p-2">{order.customer?.name || 'N/A'}</td>
                                            <td className="border border-gray-300 p-2">{order.product?.categoryId?.categoryName || 'N/A'}</td>
                                            <td className="border border-gray-300 p-2 text-right">{order.quantity}</td>
                                            <td className="border border-gray-300 p-2 text-right">${(order.totalPrice || 0).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'supplier' && (
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-gray-300 p-2 text-left">Order #</th>
                                        <th className="border border-gray-300 p-2 text-left">Date</th>
                                        <th className="border border-gray-300 p-2 text-left">Items</th>
                                        <th className="border border-gray-300 p-2 text-right">Total</th>
                                        <th className="border border-gray-300 p-2 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.purchaseOrders.map(po => (
                                        <tr key={po._id} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 p-2">{po.orderNumber}</td>
                                            <td className="border border-gray-300 p-2">{new Date(po.createdAt).toLocaleDateString()}</td>
                                            <td className="border border-gray-300 p-2">
                                                {po.items?.map((item, i) => (
                                                    <div key={i}>{item.product?.name || 'N/A'} x{item.quantity}</div>
                                                ))}
                                            </td>
                                            <td className="border border-gray-300 p-2 text-right">${(po.total || 0).toFixed(2)}</td>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    po.status === 'RECEIVED' ? 'bg-green-100 text-green-700' :
                                                    po.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>{po.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {((activeTab === 'inventory' && reportData.products?.length === 0) ||
                          (activeTab === 'sales' && reportData.orders?.length === 0) ||
                          (activeTab === 'supplier' && reportData.purchaseOrders?.length === 0)) && (
                            <p className="text-center text-gray-500 py-8">No data found for the selected filters.</p>
                        )}
                    </div>
                </div>
            )}

            {!reportData && !loading && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FaFileAlt className="text-gray-400 text-6xl mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Report Generated</h3>
                    <p className="text-gray-500">Select your filters and click "Generate Report" to view data.</p>
                </div>
            )}
        </div>
    );
};

const SummaryCard = ({ label, value, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200'
    };
    return (
        <div className={`rounded-lg border p-4 ${colors[color] || colors.blue}`}>
            <p className="text-sm font-medium opacity-75">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
    );
};

export default Reports;
