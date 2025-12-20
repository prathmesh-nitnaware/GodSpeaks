import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

// --- Layout & Protected Route ---
import AppNavbar from './components/Layout/AppNavbar'; 
import Footer from './components/Layout/Footer';
import AdminLayout from './components/Layout/AdminLayout'; // Path fixed
import ProtectedRoute from './components/Common/ProtectedRoute'; // Path fixed

// --- Page Imports (Customer) ---
import Home from './pages/Customer/Home';
import Shop from './pages/Customer/Shop';
import ProductDetail from './pages/Customer/ProductDetail';
import Cart from './pages/Customer/Cart';
import Checkout from './pages/Customer/Checkout';
import OrderSuccess from './pages/Shared/OrderSuccess';
import About from './pages/Customer/About';
import Contact from './pages/Customer/Contact';
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import Wishlist from './pages/Customer/Wishlist';
import CustomPrint from './pages/Customer/CustomPrint';
import VirtualTryOn from './pages/Customer/VirtualTryOn';
import TrackOrder from './pages/Customer/TrackOrder'; 

// --- Page Imports (Auth) ---
import ForgotPassword from './pages/Auth/ForgotPassword'; 
import ResetPassword from './pages/Auth/ResetPassword';   

// --- Page Imports (Admin) ---
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProductList from './components/Admin/ProductList'; // Pointing to components/Admin
import ProductForm from './components/Admin/ProductForm'; // Pointing to components/Admin
import OrderManagement from './pages/Admin/OrderManagement';

// --- Context Providers ---
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';

function App() {
  const location = useLocation();
  
  // Logic to hide Customer Navbar/Footer when in Admin Dashboard
  const isAdminPath = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="d-flex flex-column min-vh-100 bg-light">
            
            {!isAdminPath && <AppNavbar />}

            <main className="flex-grow-1">
              <Routes>
                
                {/* --- Public Customer Routes --- */}
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/custom-print" element={<CustomPrint />} />
                <Route path="/try-on" element={<VirtualTryOn />} />
                <Route path="/track-order" element={<TrackOrder />} /> 
                
                {/* --- Auth Routes --- */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* --- CUSTOMER PROTECTED ROUTES --- */}
                <Route element={<ProtectedRoute adminOnly={false} />}>
                  <Route path="/account" element={<CustomerDashboard />} />
                </Route>

                {/* --- ADMIN PROTECTED ROUTES --- */}
                <Route element={<ProtectedRoute adminOnly={true} />}>
                  <Route 
                    path="/admin/*" 
                    element={
                      <AdminLayout>
                        <Routes>
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="products" element={<ProductList />} />
                          <Route path="product/create" element={<ProductForm />} />
                          <Route path="product/:id/edit" element={<ProductForm />} />
                          <Route path="orders" element={<OrderManagement />} />
                        </Routes>
                      </AdminLayout>
                    } 
                  />
                </Route>

                <Route path="*" element={
                  <div className="text-center p-5">
                    <h1 className="display-4 fw-bold">404 - Page Not Found</h1>
                    <p className="mt-3 fs-5 text-muted">The page you are looking for does not exist.</p>
                  </div>
                } />
              </Routes>
            </main>

            {!isAdminPath && <Footer />}
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;