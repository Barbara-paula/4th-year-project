import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StockAlerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(false);

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
                fetchAlerts(); // Refresh alerts
            }
        } catch (error) {
            console.error("Error resolving alert:", error);
        }
    };

    useEffect(() => {
        fetchAlerts();
    }, []);

    const getAlertColor = (type) => {
        switch (type) {
            case 'OUT_OF_STOCK':
                return 'bg-red-100 border-red-400 text-red-700';
            case 'LOW_STOCK':
                return 'bg-yellow-100 border-yellow-400 text-yellow-700';
            case 'OVERSTOCK':
                return 'bg-blue-100 border-blue-400 text-blue-700';
            default:
                return 'bg-gray-100 border-gray-400 text-gray-700';
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'OUT_OF_STOCK':
                return '🚫';
            case 'LOW_STOCK':
                return '⚠️';
            case 'OVERSTOCK':
                return '📦';
            default:
                return '📊';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Stock Alerts</h1>
                <button
                    onClick={fetchAlerts}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading alerts...</div>
            ) : alerts.length === 0 ? (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    🎉 No stock alerts! All products are within acceptable stock levels.
                </div>
            ) : (
                <div className="space-y-4">
                    {alerts.map((alert) => (
                        <div
                            key={alert._id}
                            className={`border-l-4 p-4 rounded ${getAlertColor(alert.type)}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">{getAlertIcon(alert.type)}</span>
                                    <div>
                                        <h3 className="font-bold">
                                            {alert.product?.name || 'Unknown Product'}
                                        </h3>
                                        <p className="text-sm">
                                            SKU: {alert.product?.sku || 'N/A'}
                                        </p>
                                        <p className="text-sm mt-1">
                                            {alert.message}
                                        </p>
                                        <p className="text-xs mt-2">
                                            Current Stock: {alert.currentStock} | Threshold: {alert.threshold}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => resolveAlert(alert._id)}
                                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                                    >
                                        Resolve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StockAlerts;
