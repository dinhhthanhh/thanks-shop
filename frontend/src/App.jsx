import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './utils/ProtectedRoute';
import AdminRoute from './utils/AdminRoute';

// User Pages
import Home from './pages/user/Home';
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import Products from './pages/user/Products';
import ProductDetail from './pages/user/ProductDetail';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Orders from './pages/user/Orders';
import Profile from './pages/user/Profile';
import SearchResults from './pages/user/SearchResults';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminOrders from './pages/admin/Orders';
import Inventory from './pages/admin/Inventory';
import Revenue from './pages/admin/Revenue';
import Coupons from './pages/admin/Coupons';
import Categories from './pages/admin/Categories';
import Settings from './pages/admin/Settings';
import AdminChat from './pages/admin/Chat';
import ThemeDecorator from './components/common/ThemeDecorator';
import ChatWidget from './components/chat/ChatWidget';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <ThemeDecorator />
          <Toaster position="top-right" reverseOrder={false} />
          <Router>
            <div className="min-h-screen flex flex-col">
              <Routes>
                {/* Admin Routes - No Navbar/Footer */}
                <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
                <Route path="/admin/categories" element={<AdminRoute><Categories /></AdminRoute>} />
                <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
                <Route path="/admin/inventory" element={<AdminRoute><Inventory /></AdminRoute>} />
                <Route path="/admin/revenue" element={<AdminRoute><Revenue /></AdminRoute>} />
                <Route path="/admin/coupons" element={<AdminRoute><Coupons /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><Settings /></AdminRoute>} />
                <Route path="/admin/chat" element={<AdminRoute><AdminChat /></AdminRoute>} />

                {/* User Routes - With Navbar/Footer */}
                <Route path="*" element={
                  <>
                    <Navbar />
                    <main className="grow">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/products" element={<Products />} />
                        <Route path="/products/:id" element={<ProductDetail />} />
                        <Route path="/search" element={<SearchResults />} />
                        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      </Routes>
                    </main>
                    <Footer />
                    <ChatWidget />
                  </>
                } />
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
