import React, { useState, useEffect } from "react";
import {
    FaHome,
    FaShoppingCart,
    FaSignOutAlt,
    FaTruck,
    FaTable,
    FaBox,
    FaUsers,
    FaCog,
    FaBell,
    FaChartLine,
    FaFileInvoice,
    FaBars,
    FaTimes,
    FaChevronDown,
    FaFileAlt,
    FaHistory
} from "react-icons/fa"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const SidebarEnhanced = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({});
    const location = useLocation();
    const { user } = useAuth();

    const menuItems = [
        {
            name: "Dashboard",
            path: "/admin-dashboard",
            icon: <FaHome />,
            isParent: true,
            badge: null
        },
        {
            name: "Categories",
            path: "/admin-dashboard/categories",
            icon: <FaTable />,
            isParent: false,
            badge: null
        },
        {
            name: "Products",
            path: "/admin-dashboard/products",
            icon: <FaBox />,
            isParent: false,
            badge: null
        },
        {
            name: "Suppliers",
            path: "/admin-dashboard/suppliers",
            icon: <FaTruck />,
            isParent: false,
            badge: null
        },
        {
            name: "Orders",
            path: "/admin-dashboard/orders",
            icon: <FaShoppingCart />,
            isParent: false,
            badge: null
        },
        {
            name: "Purchase Orders",
            path: "/admin-dashboard/purchase-orders",
            icon: <FaFileInvoice />,
            isParent: false,
            badge: null
        },
        {
            name: "Stock Alerts",
            path: "/admin-dashboard/stock-alerts",
            icon: <FaBell />,
            isParent: false,
            badge: null
        },
        {
            name: "Stock Movements",
            path: "/admin-dashboard/stock-movements",
            icon: <FaChartLine />,
            isParent: false,
            badge: null
        },
        {
            name: "Users",
            path: "/admin-dashboard/users",
            icon: <FaUsers />,
            isParent: false,
            badge: null
        },
        {
            name: "Reports",
            path: "/admin-dashboard/reports",
            icon: <FaFileAlt />,
            isParent: false,
            badge: null
        },
        {
            name: "Audit Logs",
            path: "/admin-dashboard/audit-logs",
            icon: <FaHistory />,
            isParent: false,
            badge: null
        },
        {
            name: "Profile",
            path: "/admin-dashboard/profile",
            icon: <FaCog />,
            isParent: false,
            badge: null
        },
        {
            name: "Logout",
            path: "/admin-dashboard/logout",
            icon: <FaSignOutAlt />,
            isParent: false,
            badge: null,
            isLogout: true
        }
    ];

    const customerItems = [
        {
            name: "Products",
            path: "/customer-dashboard",
            icon: <FaBox />,
            isParent: true,
            badge: null
        },
        {
            name: "Orders",
            path: "/customer-dashboard/orders",
            icon: <FaShoppingCart />,
            isParent: false,
            badge: null
        },
        {
            name: "Profile",
            path: "/customer-dashboard/profile",
            icon: <FaCog />,
            isParent: false,
            badge: null
        },
        {
            name: "Logout",
            path: "/customer-dashboard/logout",
            icon: <FaSignOutAlt />,
            isParent: false,
            badge: null,
            isLogout: true
        }
    ];

    const [menuLinks, setMenuLinks] = useState(customerItems);

    useEffect(() => {
        if (user && user.role === "admin") {
            setMenuLinks(menuItems);
        }
    }, [user]);

    useEffect(() => {
        // Close mobile menu when route changes
        setIsMobileOpen(false);
    }, [location]);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const toggleMobileMenu = () => {
        setIsMobileOpen(!isMobileOpen);
    };

    const isActive = (path) => {
        if (path === '/admin-dashboard' || path === '/customer-dashboard') {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const MenuItem = ({ item }) => {
        const active = isActive(item.path);
        const isExpanded = expandedMenus[item.name];

        return (
            <div className="relative">
                <NavLink
                    end={item.isParent}
                    className={`group flex items-center justify-between px-3 py-3 mx-2 rounded-xl transition-all duration-200 ${active
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        } ${item.isLogout ? 'hover:bg-red-600 hover:text-white' : ''}`}
                    to={item.path}
                >
                    <div className="flex items-center">
                        <span className={`text-lg ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'} transition-colors duration-200`}>
                            {item.icon}
                        </span>
                        {!isCollapsed && (
                            <span className="ml-3 font-medium transition-opacity duration-200">
                                {item.name}
                            </span>
                        )}
                    </div>

                    {!isCollapsed && (
                        <div className="flex items-center space-x-2">
                            {item.badge && (
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${active
                                        ? 'bg-white bg-opacity-20 text-white'
                                        : 'bg-red-500 text-white'
                                    }`}>
                                    {item.badge}
                                </span>
                            )}
                            {item.children && (
                                <FaChevronDown
                                    className={`text-xs transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''
                                        }`}
                                />
                            )}
                        </div>
                    )}
                </NavLink>

                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.name}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobileMenu}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
                {isMobileOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Sidebar */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-40 flex flex-col
                bg-gradient-to-b from-gray-900 to-gray-800 text-white
                transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-20' : 'w-64'}
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <FaBox className="text-white text-lg" />
                        </div>
                        {!isCollapsed && (
                            <div>
                                <h1 className="text-lg font-bold">StockFlow</h1>
                                <p className="text-xs text-gray-400">Inventory Management System</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop Collapse Button */}
                    <button
                        onClick={toggleCollapse}
                        className="hidden lg:block p-1 rounded hover:bg-gray-700 transition-colors duration-200"
                    >
                        <FaChevronDown className={`text-sm transition-transform duration-200 ${isCollapsed ? 'rotate-90' : ''}`} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {menuLinks.map((item) => (
                            <li key={item.name}>
                                <MenuItem item={item} />
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700">
                    {!isCollapsed && (
                        <div className="text-xs text-gray-400 text-center">
                            <p>Version 1.0.0</p>
                            <p className="mt-1">© 2026 Inventory MS</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={toggleMobileMenu}
                />
            )}
        </>
    );
};

export default SidebarEnhanced;
