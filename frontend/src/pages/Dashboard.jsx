import React from "react";
import Sidebar from "../components/SidebarEnhanced";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="flex-1 lg:ml-64 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default Dashboard;