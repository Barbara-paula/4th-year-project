import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StockMovements = () => {
    const [movements, setMovements] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('');

    const fetchMovements = async () => {
        setLoading(true);
        try {
            const url = filter 
                ? `https://stockflow-backend-tq0g.onrender.com/api/stock/movements?productId=${filter}`
                : 'https://stockflow-backend-tq0g.onrender.com/api/stock/movements';
            
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            if (response.data.success) {
                setMovements(response.data.movements);
            }
        } catch (error) {
            console.error("Error fetching movements:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get("https://stockflow-backend-tq0g.onrender.com/api/product", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            if (response.data.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchMovements();
        fetchProducts();
    }, [filter]);

    const getMovementColor = (type) => {
        switch (type) {
            case 'IN':
                return 'bg-green-100 text-green-800';
            case 'OUT':
                return 'bg-red-100 text-red-800';
            case 'ADJUSTMENT':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getMovementIcon = (type) => {
        switch (type) {
            case 'IN':
                return '📥';
            case 'OUT':
                return '📤';
            case 'ADJUSTMENT':
                return '⚙️';
            default:
                return '📊';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Stock Movements</h1>
                <div className="flex space-x-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="border rounded px-3 py-2"
                    >
                        <option value="">All Products</option>
                        {products.map((product) => (
                            <option key={product._id} value={product._id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={fetchMovements}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading movements...</div>
            ) : movements.length === 0 ? (
                <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
                    No stock movements found.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date & Time
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock Change
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {movements.map((movement) => (
                                <tr key={movement._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(movement.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {movement.product?.name || 'Unknown'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                SKU: {movement.product?.sku || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementColor(movement.type)}`}>
                                            <span className="mr-1">{getMovementIcon(movement.type)}</span>
                                            {movement.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {movement.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <div className="flex items-center">
                                            <span className={movement.newStock > movement.previousStock ? 'text-green-600' : 'text-red-600'}>
                                                {movement.previousStock} → {movement.newStock}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {movement.reason}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {movement.user?.name || 'Unknown'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default StockMovements;
