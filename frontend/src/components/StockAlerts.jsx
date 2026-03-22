import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaBox, FaSpinner, FaTimes, FaFilter } from 'react-icons/fa';

const StockAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://stockflow-backend-tq0g.onrender.com/api/stock/alerts", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            if (response.data.success) {
                setAlerts(response.data.alerts);
            }
        } catch (error) {
            console.error("Error fetching alerts:", error);
        } finally {
            setLoading(false);
        }
    };

    const resolveAlert = async (alertId) => {
        try {
            const response = await axios.patch(`https://stockflow-backend-tq0g.onrender.com/api/stock/alerts/${alertId}/resolve`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            if (response.data.success) {
                fetchAlerts();
            }
        } catch (error) {
            console.error("Error resolving alert:", error);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const getAlertConfig = (type) => {
        switch (type) {
            case 'OUT_OF_STOCK':
                return {
                    icon: <FaExclamationTriangle className="text-2xl" />,
                    color: 'red',
                    bgGradient: 'bg-gradient-to-r from-red-500 to-red-600',
                    bgLight: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-700',
                    title: 'Out of Stock'
                };
            case 'LOW_STOCK':
                return {
                    icon: <FaBell className="text-2xl" />,
                    color: 'yellow',
                    bgGradient: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
                    bgLight: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    text: 'text-yellow-700',
                    title: 'Low Stock'
                };
            case 'OVERSTOCK':
                return {
                    icon: <FaBox className="text-2xl" />,
                    color: 'blue',
                    bgGradient: 'bg-gradient-to-r from-blue-500 to-blue-600',
                    bgLight: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-700',
                    title: 'Overstock'
                };
            default:
                return {
                    icon: <FaBell className="text-2xl" />,
                    color: 'gray',
                    bgGradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
                    bgLight: 'bg-gray-50',
                    border: 'border-gray-200',
                    text: 'text-gray-700',
                    title: 'Unknown'
                };
        }
    };

    const filteredAlerts = filter === 'all' ? alerts : alerts.filter(alert => alert.type === filter);

    const AlertCard = ({ alert }) => {
        const config = getAlertConfig(alert.type);
        
        return (
            <div className={`${config.bgLight} ${config.border} border rounded-xl p-6 hover:shadow-lg transition-all duration-300`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`${config.bgGradient} p-3 rounded-full text-white`}>
                            {config.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{alert.product?.name || 'Unknown Product'}</h3>
                            <p className="text-sm text-gray-500">SKU: {alert.product?.sku || 'N/A'}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bgGradient} text-white`}>
                        {config.title}
                    </span>
                </div>
                
                <div className="mb-4">
                    <p className="text-gray-700 mb-2">{alert.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                            <FaBox className="mr-1" />
                            Current: {alert.currentStock}
                        </span>
                        <span className="flex items-center">
                            <FaExclamationTriangle className="mr-1" />
                            Threshold: {alert.threshold}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleString()}
                    </span>
                    <button
                        onClick={() => resolveAlert(alert._id)}
                        className="flex items-center px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 text-sm"
                    >
                        <FaCheckCircle className="mr-1" />
                        Resolve
                    </button>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
                <span className="ml-3 text-lg text-gray-600">Loading alerts...</span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Stock Alerts</h1>
                <p className="text-gray-600">Monitor and manage inventory stock alerts</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                    <FaFilter className="text-gray-400" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">All Alerts</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                        <option value="LOW_STOCK">Low Stock</option>
                        <option value="OVERSTOCK">Overstock</option>
                    </select>
                </div>
                <button
                    onClick={fetchAlerts}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
                >
                    <FaBell className="mr-2" />
                    Refresh Alerts
                </button>
            </div>

            {filteredAlerts.length === 0 ? (
                <div className="text-center py-12">
                    <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No alerts found</h3>
                    <p className="text-gray-500">
                        {filter === 'all' 
                            ? "Great! All your products are within acceptable stock levels." 
                            : `No ${filter.toLowerCase().replace('_', ' ')} alerts.`}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAlerts.map((alert) => (
                        <AlertCard key={alert._id} alert={alert} />
                    ))}
                </div>
            )}

            {/* Alert Summary */}
            {alerts.length > 0 && (
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Alert Summary</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-red-600">
                                {alerts.filter(a => a.type === 'OUT_OF_STOCK').length}
                            </div>
                            <p className="text-sm text-gray-600">Out of Stock</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-yellow-600">
                                {alerts.filter(a => a.type === 'LOW_STOCK').length}
                            </div>
                            <p className="text-sm text-gray-600">Low Stock</p>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">
                                {alerts.filter(a => a.type === 'OVERSTOCK').length}
                            </div>
                            <p className="text-sm text-gray-600">Overstock</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockAlerts;
