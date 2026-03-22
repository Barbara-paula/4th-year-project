import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Root from './utils/Root.jsx'
import Login from './pages/login.jsx'
import ProtectedRoutes from './utils/ProtectedRoutes.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Categories from './components/Categories.jsx'
import Suppliers from './components/Suppliers.jsx'
import Products from './components/Products.jsx'
import Users from './components/Users.jsx'
import Logout from './components/Logout.jsx'
import CustomerProducts from './components/CusomerProducts.jsx'
import Orders from './components/Orders.jsx'
import Summary from './components/Summary.jsx'
import Profile from './components/Profile.jsx'
import StockAlerts from './components/StockAlerts.jsx'
import StockMovements from './components/StockMovements.jsx'
import PurchaseOrders from './components/PurchaseOrders.jsx'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path='/' element={<Navigate to='/login' replace />} />

        <Route
          path='/admin-dashboard' element={
            <ProtectedRoutes requiredRole={['admin']}>
              <Dashboard />
            </ProtectedRoutes>
          }
        >
          <Route index element={<Summary />} />
          <Route path='categories' element={<Categories />} />
          <Route path='products' element={<Products />} />
          <Route path='suppliers' element={<Suppliers />} />
          <Route path='orders' element={<Orders />} />
          <Route path='users' element={<Users />} />
          <Route path='profile' element={<Profile />} />
          <Route path='stock-alerts' element={<StockAlerts />} />
          <Route path='stock-movements' element={<StockMovements />} />
          <Route path='purchase-orders' element={<PurchaseOrders />} />
          <Route path='logout' element={<Logout />} />
        </Route>
        <Route
          path='/customer-dashboard'
          element={
            <ProtectedRoutes requiredRole={['admin', 'customer']}>
              <Dashboard />
            </ProtectedRoutes>
          }
        >
          <Route index element={<CustomerProducts />} />
          <Route path='orders' element={<Orders />} />
          <Route path='profile' element={<Profile />} />
          <Route path='logout' element={<Logout />} />
        </Route>

        <Route path='login' element={<Login />} />
        <Route path='unauthorized' element={<p className='font-bold text-3xl mt-20 ml-20'>Unauthorized</p>} />
      </Routes>
    </Router>
  )
}

export default App
