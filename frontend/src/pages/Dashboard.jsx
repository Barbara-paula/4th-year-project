import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-16 md:ml-64 bg-gray-100 min-h-screen p-6">
                <Outlet />
            </main>
        </div>
    );
}

export default Dashboard