import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Layout & Protected Route ---
import AppNavbar from './components/Layout/AppNavbar'; 
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Common/ProtectedRoute';

// --- Page Imports ---
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
import CustomPrint from './pages/Customer/CustomPrint'; // <--- 1. IMPORT THIS

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProductManagement from './pages/Admin/ProductManagement';
import OrderManagement from './pages/Admin/OrderManagement';

// --- Context Providers ---
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="d-flex flex-column min-vh-100 bg-light">
            
            <AppNavbar />

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
                
                {/* --- NEW ROUTE FOR CUSTOM PRINT --- */}
                <Route path="/custom-print" element={<CustomPrint />} /> {/* <--- 2. ADD THIS */}
                
                {/* --- Public Admin Route (Login) --- */}
                <Route path="/admin/login" element={<AdminLogin />} />
                
                {/* --- CUSTOMER PROTECTED ROUTES --- */}
                <Route element={<ProtectedRoute adminOnly={false} />}>
                  <Route path="/account" element={<CustomerDashboard />} />
                </Route>

                {/* --- ADMIN PROTECTED ROUTES --- */}
                <Route element={<ProtectedRoute adminOnly={true} />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/products" element={<ProductManagement />} />
                  <Route path="/admin/orders" element={<OrderManagement />} />
                </Route>

                {/* --- 404 Route --- */}
                <Route path="*" element={
                  <div className="text-center p-5">
                    <h1 className="display-4 fw-bold">404 - Page Not Found</h1>
                  </div>
                } />
              </Routes>
            </main>

            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;