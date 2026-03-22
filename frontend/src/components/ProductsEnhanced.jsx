import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaBox, FaDollarSign, FaWarehouse, FaSpinner, FaTimes } from 'react-icons/fa';

const ProductsEnhanced = () => {
    const [openModal, setOpenModal] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: "",
        supplierId: "",
        minStockThreshold: "10",
        maxStockThreshold: "100"
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://stockflow-backend-tq0g.onrender.com/api/product", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            if (response.data.success) {
                setSuppliers(response.data.suppliers);
                setCategories(response.data.categories);
                setProducts(response.data.products);
                setFilteredProducts(response.data.products);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        const filtered = products.filter((product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleEdit = (product) => {
        setOpenModal(true);
        setEditProduct(product._id);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            categoryId: product.categoryId?._id || "",
            supplierId: product.supplierId?._id || "",
            minStockThreshold: product.minStockThreshold?.toString() || "10",
            maxStockThreshold: product.maxStockThreshold?.toString() || "100"
        });
    };

    const handleDelete = async (Id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        
        setLoading(true);
        try {
            const response = await axios.delete(`https://stockflow-backend-tq0g.onrender.com/api/product/${Id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                },
            });
            if (response.data.success) {
                fetchProducts();
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setOpenModal(false);
        setEditProduct(null);
        setFormData({
            name: "",
            description: "",
            price: "",
            stock: "",
            categoryId: "",
            supplierId: "",
            minStockThreshold: "10",
            maxStockThreshold: "100"
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editProduct) {
                const response = await axios.put(`https://stockflow-backend-tq0g.onrender.com/api/product/${editProduct}`, formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                    },
                });
                if (response.data.success) {
                    fetchProducts();
                    closeModal();
                }
            } else {
                const response = await axios.post("https://stockflow-backend-tq0g.onrender.com/api/product/add", formData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("pos-token")}`,
                    },
                });
                if (response.data.success) {
                    fetchProducts();
                    closeModal();
                }
            }
        } catch (error) {
            console.error("Error saving product:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (stock, minThreshold) => {
        if (stock === 0) return { color: 'red', text: 'Out of Stock', bg: 'bg-red-100 text-red-700' };
        if (stock <= minThreshold) return { color: 'yellow', text: 'Low Stock', bg: 'bg-yellow-100 text-yellow-700' };
        return { color: 'green', text: 'In Stock', bg: 'bg-green-100 text-green-700' };
    };

    const ProductCard = ({ product, index }) => {
        const stockStatus = getStockStatus(product.stock, product.minStockThreshold || 10);
        
        return (
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">SKU: {product.sku || 'N/A'}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.bg}`}>
                            {stockStatus.text}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center">
                            <FaDollarSign className="text-green-500 mr-2" />
                            <div>
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="font-semibold text-gray-800">${product.price}</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <FaWarehouse className="text-blue-500 mr-2" />
                            <div>
                                <p className="text-xs text-gray-500">Stock</p>
                                <p className="font-semibold text-gray-800">{product.stock}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Category</p>
                        <p className="text-sm font-medium text-gray-700">{product.categoryId?.categoryName || 'N/A'}</p>
                        <p className="text-xs text-gray-500 mt-2 mb-1">Supplier</p>
                        <p className="text-sm font-medium text-gray-700">{product.supplierId?.name || 'N/A'}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleEdit(product)}
                            className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center"
                        >
                            <FaEdit className="mr-2" /> Edit
                        </button>
                        <button
                            onClick={() => handleDelete(product._id)}
                            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center justify-center"
                        >
                            <FaTrash className="mr-2" /> Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <FaSpinner className="animate-spin text-4xl text-blue-500" />
                <span className="ml-3 text-lg text-gray-600">Loading products...</span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Product Management</h1>
                <p className="text-gray-600">Manage your inventory products and track stock levels</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <div className="relative w-full sm:w-96">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products by name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                <button
                    onClick={() => setOpenModal(true)}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                    <FaPlus className="mr-2" /> Add Product
                </button>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                    <FaBox className="text-gray-400 text-6xl mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
                    <p className="text-gray-500">
                        {searchTerm ? 'Try adjusting your search terms' : 'Start by adding your first product'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product, index) => (
                        <ProductCard key={product._id} product={product} index={index} />
                    ))}
                </div>
            )}

            {/* Modal */}
            {openModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editProduct ? 'Edit Product' : 'Add New Product'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter product name"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        step="0.01"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter product description"
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        placeholder="0"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Stock Threshold</label>
                                    <input
                                        type="number"
                                        name="minStockThreshold"
                                        value={formData.minStockThreshold}
                                        onChange={handleChange}
                                        placeholder="10"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Stock Threshold</label>
                                    <input
                                        type="number"
                                        name="maxStockThreshold"
                                        value={formData.maxStockThreshold}
                                        onChange={handleChange}
                                        placeholder="100"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((category) => (
                                            <option key={category._id} value={category._id}>
                                                {category.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
                                    <select
                                        name="supplierId"
                                        value={formData.supplierId}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <FaSpinner className="animate-spin mx-auto" />
                                    ) : (
                                        editProduct ? 'Update Product' : 'Add Product'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsEnhanced;
