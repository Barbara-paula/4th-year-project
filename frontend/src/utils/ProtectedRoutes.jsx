import { useAuth } from "../context/AuthContext.jsx"
import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children, requiredRole }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (!requiredRole || !requiredRole.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export default ProtectedRoutes;