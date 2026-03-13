import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Root = () => {
    const { user } = useAuth();

    if (user) {
        if (user.role === "admin") {
            return <Navigate to="/admin-dashboard" replace />;
        }
        if (user.role === "customer") {
            return <Navigate to="/customer-dashboard" replace />;
        }
    }
    return <Navigate to="/login" replace />;
}

export default Root;