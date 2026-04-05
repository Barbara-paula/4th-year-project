import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHistory, FaSearch, FaSpinner, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const [filters, setFilters] = useState({
        action: '',
        entity: '',
        startDate: '',
        endDate: ''
    });

    const API_BASE = "https://stockflow-backend-tq0g.onrender.com/api";

    const actions = ['LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT'];
    const entities = ['User', 'Product', 'Category', 'Supplier', 'Order', 'PurchaseOrder', 'StockMovement', 'Report'];

    useEffect(() => {
        fetchLogs();
    }, [currentPage]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage);
            params.append('limit', '30');
            if (filters.action) params.append('action', filters.action);
            if (filters.entity) params.append('entity', filters.entity);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);

            const response = await axios.get(`${API_BASE}/audit?${params.toString()}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('pos-token')}` }
            });

            if (response.data.success) {
                setLogs(response.data.logs);
                setTotalPages(response.data.totalPages);
                setTotalLogs(response.data.totalLogs);
            }
        } catch (error) {
            console.error("Error fetching audit logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchLogs();
    };

    const getActionBadge = (action) => {
        const styles = {
            LOGIN: 'bg-blue-100 text-blue-700',
            CREATE: 'bg-green-100 text-green-700',
            UPDATE: 'bg-yellow-100 text-yellow-700',
            DELETE: 'bg-red-100 text-red-700',
            EXPORT: 'bg-purple-100 text-purple-700'
        };
        return styles[action] || 'bg-gray-100 text-gray-700';
    };

    const getEntityBadge = (entity) => {
        const styles = {
            User: 'bg-indigo-100 text-indigo-700',
            Product: 'bg-cyan-100 text-cyan-700',
            Category: 'bg-teal-100 text-teal-700',
            Supplier: 'bg-orange-100 text-orange-700',
            Order: 'bg-pink-100 text-pink-700',
            PurchaseOrder: 'bg-amber-100 text-amber-700',
            StockMovement: 'bg-lime-100 text-lime-700',
            Report: 'bg-violet-100 text-violet-700'
        };
        return styles[entity] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Audit Logs</h1>
                <p className="text-gray-600">Track all system activities including logins, changes, and transactions</p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Action</label>
                        <select
                            name="action"
                            value={filters.action}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Actions</option>
                            {actions.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Entity</label>
                        <select
                            name="entity"
                            value={filters.entity}
                            onChange={handleFilterChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Entities</option>
                            {entities.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                    </div>
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
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                        >
                            <FaSearch className="mr-2" /> Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <FaSpinner className="animate-spin text-4xl text-blue-500" />
                        <span className="ml-3 text-lg text-gray-600">Loading logs...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <FaHistory className="text-gray-400 text-6xl mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Logs Found</h3>
                        <p className="text-gray-500">No activity logs match the selected filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Timestamp</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">User</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Entity</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log) => (
                                        <tr key={log._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                <span className="font-medium text-gray-800">{log.userName || log.user?.name || 'System'}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionBadge(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getEntityBadge(log.entity)}`}>
                                                    {log.entity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600 max-w-md truncate">
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Showing page {currentPage} of {totalPages} ({totalLogs} total logs)
                            </p>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage <= 1}
                                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
                                >
                                    <FaChevronLeft className="mr-1" /> Prev
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center"
                                >
                                    Next <FaChevronRight className="ml-1" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
