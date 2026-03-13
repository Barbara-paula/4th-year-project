import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Root from './utils/Root'
import Login from './pages/login'
import ProtectedRoutes from './utils/ProtectedRoutes'
import Dashboard from './pages/Dashboard'
import Categories from './components/Categories'
import Suppliers from './components/Suppliers'
import Products from './components/Products'
import Users from './components/Users'
import Logout from './components/Logout'
import CustomerProducts from './components/CusomerProducts'
import Orders from './components/Orders'
import Summary from './components/Summary'
import Profile from './components/Profile'

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
