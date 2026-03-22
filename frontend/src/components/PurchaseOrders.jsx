import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PurchaseOrders = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        supplier: '',
        items: [{ product: '', quantity: 1, unitCost: 0 }],
        expectedDeliveryDate: '',
        notes: ''
    });

    const fetchPurchaseOrders = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://stockflow-backend-tq0g.onrender.com/api/purchase-order", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            if (response.data.success) {
                setPurchaseOrders(response.data.purchaseOrders);
            }
        } catch (error) {
            console.error("Error fetching purchase orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const response = await axios.get("https://stockflow-backend-tq0g.onrender.com/api/supplier", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            if (response.data.success) {
                setSuppliers(response.data.suppliers);
            }
        } catch (error) {
            console.error("Error fetching suppliers:", error);
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
        fetchPurchaseOrders();
        fetchSuppliers();
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Calculate totals for each item
            const itemsWithTotals = formData.items.map(item => ({
                ...item,
                total: item.quantity * item.unitCost
            }));

            const subtotal = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);
            const tax = subtotal * 0.1;
            const total = subtotal + tax;

            const orderData = {
                ...formData,
                items: itemsWithTotals,
                subtotal,
                tax,
                total
            };

            const response = await axios.post("https://stockflow-backend-tq0g.onrender.com/api/purchase-order", orderData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });

            if (response.data.success) {
                setShowModal(false);
                setFormData({
                    supplier: '',
                    items: [{ product: '', quantity: 1, unitCost: 0 }],
                    expectedDeliveryDate: '',
                    notes: ''
                });
                fetchPurchaseOrders();
            }
        } catch (error) {
            console.error("Error creating purchase order:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, status) => {
        try {
            const response = await axios.patch(`https://stockflow-backend-tq0g.onrender.com/api/purchase-order/${orderId}/status`, 
                { status }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            if (response.data.success) {
                fetchPurchaseOrders();
            }
        } catch (error) {
            console.error("Error updating order status:", error);
        }
    };

    const deleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this purchase order?')) return;
        
        try {
            const response = await axios.delete(`https://stockflow-backend-tq0g.onrender.com/api/purchase-order/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            if (response.data.success) {
                fetchPurchaseOrders();
            }
        } catch (error) {
            console.error("Error deleting purchase order:", error);
        }
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product: '', quantity: 1, unitCost: 0 }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-800';
            case 'PARTIAL':
                return 'bg-purple-100 text-purple-800';
            case 'RECEIVED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Purchase Orders</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Create Purchase Order
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8">Loading purchase orders...</div>
            ) : purchaseOrders.length === 0 ? (
                <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded">
                    No purchase orders found.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order Number
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Supplier
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order Date
                                </th>
                                <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {purchaseOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {order.orderNumber}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.supplier?.name || 'Unknown'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${order.total.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(order.orderDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {order.status !== 'RECEIVED' && order.status !== 'CANCELLED' && (
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    className="border rounded px-2 py-1 text-xs"
                                                >
                                                    <option value="PENDING">Pending</option>
                                                    <option value="CONFIRMED">Confirmed</option>
                                                    <option value="RECEIVED">Received</option>
                                                    <option value="CANCELLED">Cancelled</option>
                                                </select>
                                            )}
                                            {order.status !== 'RECEIVED' && (
                                                <button
                                                    onClick={() => deleteOrder(order._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for creating purchase order */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Create Purchase Order</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-gray-700 mb-2">Supplier</label>
                                    <select
                                        value={formData.supplier}
                                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    >
                                        <option value="">Select Supplier</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier._id} value={supplier._id}>
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-2">Expected Delivery Date</label>
                                    <input
                                        type="date"
                                        value={formData.expectedDeliveryDate}
                                        onChange={(e) => setFormData({ ...formData, expectedDeliveryDate: e.target.value })}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Items</label>
                                {formData.items.map((item, index) => (
                                    <div key={index} className="flex space-x-2 mb-2">
                                        <select
                                            value={item.product}
                                            onChange={(e) => updateItem(index, 'product', e.target.value)}
                                            className="flex-1 border rounded px-3 py-2"
                                            required
                                        >
                                            <option value="">Select Product</option>
                                            {products.map((product) => (
                                                <option key={product._id} value={product._id}>
                                                    {product.name} (SKU: {product.sku})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Quantity"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                            className="w-24 border rounded px-3 py-2"
                                            min="1"
                                            required
                                        />
                                        <input
                                            type="number"
                                            placeholder="Unit Cost"
                                            value={item.unitCost}
                                            onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value))}
                                            className="w-32 border rounded px-3 py-2"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2"
                                >
                                    Add Item
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    rows="3"
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    {loading ? 'Creating...' : 'Create Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrders;
