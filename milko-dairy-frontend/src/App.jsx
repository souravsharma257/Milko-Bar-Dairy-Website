
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, LogOut, Package, Home, Settings, Users, TrendingUp, Menu, X, Plus, Minus, Trash2, MapPin, Phone, Mail, Calendar, Eye, EyeOff } from 'lucide-react';
import { authAPI, productsAPI, ordersAPI } from './services/api';
import AuthModal from './AuthModal';
// import ProductReviews from './components/ProductReviews';
// import UserProfileMenu from './components/UserProfileMenu';

const AdminDashboard = ({ currentUser }) => { 
  const [adminView, setAdminView] = useState('orders');  
  const [allOrders, setAllOrders] = useState([]);  

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
      const response = await ordersAPI.getAll();  // Assuming API method
        setAllOrders(response.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
  fetchOrders();
  }, []);

  // Function define karo (yeh missing tha)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // API call (apne ordersAPI ke hisab se adjust karo)
      await ordersAPI.updateOrderStatus(orderId, { status: newStatus });
      // Local state update
      setAllOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      console.log('Status updated!');  // Or alert/toast
    } catch (error) {
      console.error('Update failed:', error);
    }
  };
  // View switcher (if needed, e.g., buttons to change adminView)
  const switchView = (view) => {
    setAdminView(view);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">  {/* Parent container */}
      {/* Sidebar or tabs for views */}
      <div className="flex space-x-4 mb-6">
        <button onClick={() => switchView('orders')} className={`px-4 py-2 rounded ${adminView === 'orders' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          Orders
        </button>
        {/* Add other views like products, users */}
      </div>

      {/* Orders Section - Only one block, no duplicate */}
      {adminView === 'orders' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-2xl font-bold mb-6">All Orders</h3>
          
          {allOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-xl">No orders yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left">Order ID</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Total</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map(order => (
                    <tr key={order._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-semibold">#{order._id.slice(-6)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold">{order.userName}</p>
                        <p className="text-sm text-gray-600">{order.userPhone || 'N/A'}</p>
                      </td>
                      <td className="px-4 py-3">₹{order.total}</td>
                      <td className="px-4 py-3">
                        <select 
                          value={order.status} 
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          className="px-3 py-1 rounded-full text-sm font-semibold border-2 cursor-pointer bg-gray-50"
                        >
                          <option value="Pending">⏳ Pending</option>
                          <option value="In Transit">🚚 In Transit</option>
                          <option value="Delivered">🎉 Delivered</option>
                          {/* Add more if needed */}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => {
                            const details = `Order #${order._id.slice(-6)}\nCustomer: ${order.userName}\nTotal: ₹${order.total}`;
                            alert(details);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Other views jaise products, users - similar tarike se add karo */}
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  
  // Auth States
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef(null);

  const categories = ['All', 'Milk', 'Dahi', 'Paneer', 'Butter', 'Ghee', 'Lassi', 'Buttermilk', 'Ice Cream'];

  // Load user and products on mount
  useEffect(() => {
  try {
    const storedUser = authAPI.getStoredUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  } catch (error) {
    console.error('Error loading user:', error);
    localStorage.removeItem('user'); // Clear corrupted data
  }
  fetchProducts();
}, []);
  // Fetch Products with filters
  // Products fetch करने में
const fetchProducts = async (filters = {}) => {
  try {
    setLoading(true);
    const response = await productsAPI.getAll(filters);
    setProducts(response.data.data || response.data || []); // ⬅️ यह change करो
  } catch (error) {
    console.error('Error fetching products:', error);
    setProducts([]); // ⬅️ empty array set करो
    alert('Failed to load products');
  } finally {
    setLoading(false);
  }
};
  // Fetch My Orders
 // fetchMyOrders function update करो
const fetchMyOrders = async () => {
  try {
    const response = await ordersAPI.getMyOrders();
    const ordersData = Array.isArray(response.data) ? response.data : response.data.data || [];
    setOrders(ordersData);
  } catch (error) {
    console.error('Error fetching orders:', error);
    setOrders([]); // empty array
  }
};

// Fetch All Orders (Admin)
const fetchAllOrders = async () => {
  try {
    const response = await ordersAPI.getAll();
    setAllOrders(response.data || []);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    // ADD THIS LINE:
    if (error.response?.status === 401) {
      alert('Session expired. Please login again.');
      handleLogout();
    }
  }
};
  // Handle Auth - Updated
  const handleAuth = async (formData, mode) => {
    setLoading(true);
  
    try {
      let userData;
    
      if (mode === 'login') {
        userData = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
      } else {
        userData = await authAPI.register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          password: formData.password
        });
      }

      setCurrentUser(userData);
      setShowAuth(false);
    
      if (userData.role === 'admin') {
        setView('admin-dashboard');
        fetchAllOrders();
      } else {
        setView('home');
        fetchMyOrders();
      }
    
      alert(mode === 'login' ? 'Login successful!' : 'Registration successful!');
    } catch (error) {
      alert(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  // Handle Logout
  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
    setCart([]);
    setOrders([]);
    setAllOrders([]);
    setView('home');
  };

  // Cart Functions
  const addToCart = (product) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId, change) => {
    setCart(cart.map(item => {
      if (item._id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Place Order - FIXED
const placeOrder = async (paymentMethod) => {
  if (!currentUser) {
    alert('Please login first!');
    return;
  }
  
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  try {
    setLoading(true);

    // User name safely get karo
    const userName = currentUser.fullName || 
                     `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 
                     currentUser.name || 
                     'Customer';

    // User phone safely get karo
    const userPhone = currentUser.phone || 
                      currentUser.userPhone || 
                      '';

    // User address safely get karo
    const userAddress = currentUser.address || 
                        currentUser.userAddress || 
                        '';
    
    const orderData = {
      userName,
      userPhone,
      userAddress,
      items: cart.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity: item.quantity,
        image: item.image
      })),
      total: cartTotal,
      paymentMethod
    };

    console.log('Order Data:', orderData); // Debug ke liye

    const response = await ordersAPI.create(orderData);
    
    setCart([]);
    await fetchMyOrders();
    await fetchProducts();
    setView('orders');
    alert('Order placed successfully! ✅');
  } catch (error) {
    console.error('Order error:', error);
    alert(error.response?.data?.message || 'Failed to place order');
  } finally {
    setLoading(false);
  }
};
  // Update Product Price (Admin)
  const updateProductPrice = async (productId, newPrice) => {
    try {
      await productsAPI.updatePrice(productId, parseFloat(newPrice));
      await fetchProducts();
    } catch (error) {
      throw error;
    }
  };

  // Update Order Status (Admin)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      await fetchAllOrders();
    } catch (error) {
      throw error;
    }
  };

  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);

  // Header Component
  const Header = () => (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🥛</div>
            <div>
              <h1 className="text-2xl font-bold">Milko Bar Dairy</h1>
              <p className="text-xs text-blue-200">Fresh Dairy Products - Shahjahanpur</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <button onClick={() => setView('home')} className="hover:text-blue-200 transition flex items-center gap-2">
              <Home size={18} /> Home
            </button>
            {currentUser && currentUser.role === 'customer' && (
              <>
                <button onClick={() => setView('products')} className="hover:text-blue-200 transition flex items-center gap-2">
                  <Package size={18} /> Products
                </button>
                <button onClick={() => setView('orders')} className="hover:text-blue-200 transition flex items-center gap-2">
                  <TrendingUp size={18} /> My Orders
                </button>
                <button onClick={() => setView('cart')} className="hover:text-blue-200 transition relative">
                  <ShoppingCart size={20} />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </button>
              </>
            )}
            {currentUser && currentUser.role === 'admin' && (
              <button onClick={() => setView('admin-dashboard')} className="hover:text-blue-200 transition flex items-center gap-2">
                <Settings size={18} /> Dashboard
              </button>
            )}
            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm">Hi, {currentUser.fullName || currentUser.firstName}</span>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition flex items-center gap-2">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <button onClick={() => { setShowAuth(true); setAuthMode('login'); }} className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
                Login
              </button>
            )}
          </nav>

          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden">
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {showMobileMenu && (
          <nav className="md:hidden mt-4 pb-4 space-y-3">
            <button onClick={() => { setView('home'); setShowMobileMenu(false); }} className="block w-full text-left hover:text-blue-200">Home</button>
            {currentUser && currentUser.role === 'customer' && (
              <>
                <button onClick={() => { setView('products'); setShowMobileMenu(false); }} className="block w-full text-left hover:text-blue-200">Products</button>
                <button onClick={() => { setView('orders'); setShowMobileMenu(false); }} className="block w-full text-left hover:text-blue-200">My Orders</button>
                <button onClick={() => { setView('cart'); setShowMobileMenu(false); }} className="block w-full text-left hover:text-blue-200">Cart ({cart.length})</button>
              </>
            )}
            {currentUser ? (
              <button onClick={handleLogout} className="block w-full text-left text-red-300 hover:text-red-200">Logout</button>
            ) : (
              <button onClick={() => { setShowAuth(true); setAuthMode('login'); setShowMobileMenu(false); }} className="block w-full text-left hover:text-blue-200">Login</button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
  // HomeView
  const HomeView = () => (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-4">Fresh Dairy Products</h2>
          <p className="text-xl mb-8 text-blue-100">Pure & Healthy Products Delivered to Your Doorstep</p>
          <p className="text-lg mb-8">📍 Serving Shahjahanpur with Love</p>
          {!currentUser && (
            <button onClick={() => { setShowAuth(true); setAuthMode('register'); }} className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition shadow-lg">
              Get Started - Register Now
            </button>
          )}
          {currentUser && currentUser.role === 'customer' && (
            <button onClick={() => setView('products')} className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition shadow-lg">
              Shop Now
            </button>
          )}
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Milko Bar Dairy?</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition">
            <div className="text-5xl mb-4">🥛</div>
            <h4 className="text-xl font-bold mb-2">100% Pure</h4>
            <p className="text-gray-600">Farm fresh dairy products with no additives</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition">
            <div className="text-5xl mb-4">🚚</div>
            <h4 className="text-xl font-bold mb-2">Fast Delivery</h4>
            <p className="text-gray-600">Quick home delivery across Shahjahanpur</p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition">
            <div className="text-5xl mb-4">💰</div>
            <h4 className="text-xl font-bold mb-2">Best Prices</h4>
            <p className="text-gray-600">Competitive rates with premium quality</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Products</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(1, 9).map(cat => (
              <div key={cat} className="bg-white p-6 rounded-xl shadow-md text-center hover:shadow-lg transition cursor-pointer" onClick={() => { setSelectedCategory(cat); setView('products'); }}>
                <div className="text-4xl mb-3">
                  {cat === 'Milk' && '🥛'}
                  {cat === 'Dahi' && '🥣'}
                  {cat === 'Paneer' && '🧈'}
                  {cat === 'Butter' && '🧈'}
                  {cat === 'Ghee' && '🫙'}
                  {cat === 'Lassi' && '🥤'}
                  {cat === 'Buttermilk' && '🥤'}
                  {cat === 'Ice Cream' && '🍨'}
                </div>
                <h4 className="font-semibold text-gray-800">{cat}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="bg-blue-600 text-white rounded-2xl p-12 text-center">
          <h3 className="text-3xl font-bold mb-6">Contact Us</h3>
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <Phone size={20} />
              <span>+91 9358634955</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={20} />
              <span>info@milkobardairy.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={20} />
              <span>Shahjahanpur, Rajasthan</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // ProductsView Component - Replace in App.js
  const ProductsView = () => {
    
    const [addedFeedback, setAddedFeedback] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    if (!filteredProducts || !Array.isArray(filteredProducts)) {
      return <div>Loading...</div>;
    }
    

    // Apply filters
    const applyFilters = async () => {
      const filters = {
        category: selectedCategory,
        search: searchTerm,
        minPrice: minPrice,
        maxPrice: maxPrice,
        sort: sortBy
      };
      await fetchProducts(filters);
    };

    // Reset filters
    const resetFilters = async () => {
      setSearchTerm('');
      setMinPrice('');
      setMaxPrice('');
      setSortBy('');
      setSelectedCategory('All');
      await fetchProducts({ category: 'All' });
    };

    const handleAddToCart = (product) => {
      addToCart(product);
      setAddedFeedback(prev => ({ ...prev, [product._id]: true }));
      setTimeout(() => {
        setAddedFeedback(prev => ({ ...prev, [product._id]: false }));
      }, 1000);
    };

    const isInCart = (productId) => cart.some(item => item._id === productId);
    const cartQuantity = (productId) => cart.find(item => item._id === productId)?.quantity || 0;

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">Our Products</h2>
        
          {/* Search & Filter Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            {/* Search Bar */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="🔍 Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              <button
                onClick={applyFilters}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4 mt-4">
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Min Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                    <input
                      type="number"
                      placeholder="₹ 0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Max Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                    <input
                      type="number"
                      placeholder="₹ 1000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Default</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="name_asc">Name: A to Z</option>
                      <option value="name_desc">Name: Z to A</option>
                    </select>
                  </div>

                  {/* Reset Button */}
                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="mb-8 flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  fetchProducts({ category: cat, search: searchTerm, minPrice, maxPrice, sort: sortBy });
                }}
                className={`px-6 py-2 rounded-full font-semibold transition ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Count */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing <span className="font-bold text-blue-600">{filteredProducts.length}</span> products
            </p>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔄</div>
              <p className="text-xl text-gray-600">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-2xl font-bold text-gray-800 mb-2">No products found</p>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => {
                const inCart = isInCart(product._id);
                const qty = cartQuantity(product._id);
                const showAdded = addedFeedback[product._id];
                const isOutOfStock = product.stock === 0;
              
                // Use imageUrl if available, else use emoji
                const productImage = product.imageUrl
                  ? `http://localhost:5000${product.imageUrl}`
                  : product.image;

                return (
                  <div key={product._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-8 text-center h-48 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" font-size="48" text-anchor="middle" dy=".3em">{product.image}</text></svg>'; }}
                        />
                      ) : (
                        <div className="text-6xl">{product.image}</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{product.unit}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-blue-600">₹{product.price}</span>
                        <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`}>
                          {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
                        </span>
                      </div>
                      <button
                        onClick={() => !isOutOfStock && handleAddToCart(product)}
                        disabled={isOutOfStock || showAdded}
                        className={`
                        w-full py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105
                        ${isOutOfStock
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : inCart && !showAdded
                              ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                              : showAdded
                                ? 'bg-green-500 text-white animate-pulse'
                                : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg'
                          }
                      `}
                      >
                        {isOutOfStock
                          ? 'Out of Stock'
                          : showAdded
                            ? 'Added! 🎉'
                            : inCart
                              ? `Added (${qty})`
                              : 'Add to Cart'
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };
  


  // CartView
  const CartView = () => (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart</h2>
        
        {cart.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
            <button onClick={() => setView('products')} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md mb-6">
              {cart.map(item => (
                <div key={item._id} className="flex items-center gap-4 p-6 border-b last:border-b-0">
                  <div className="text-4xl">{item.image}</div>
                  <div className="flex-1">
                    <h3 className="font-bold">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.unit}</p>
                    <p className="text-lg font-bold text-blue-600">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => updateCartQuantity(item._id, -1)} className="bg-gray-200 hover:bg-gray-300 p-2 rounded">
                      <Minus size={16} />
                    </button>
                    <span className="font-bold w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item._id, 1)} className="bg-gray-200 hover:bg-gray-300 p-2 rounded">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{item.price * item.quantity}</p>
                    <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 text-sm mt-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-6 text-2xl font-bold">
                <span>Total:</span>
                <span className="text-blue-600">₹{cartTotal}</span>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => placeOrder('COD')}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : 'Place Order - Cash on Delivery'}
                </button>
                <button
                  onClick={() => placeOrder('Online')}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                >
                  {loading ? 'Processing...' : 'Place Order - Pay Online'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // OrdersView Component - Replace in App.js
  const OrdersView = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    if (!Array.isArray(orders)) {
      return <div>Loading orders...</div>;
    }


    const getStatusColor = (status) => {
      const colors = {
        'Pending': 'bg-yellow-100 text-yellow-700',
        'Confirmed': 'bg-blue-100 text-blue-700',
        'Processing': 'bg-purple-100 text-purple-700',
        'In Transit': 'bg-indigo-100 text-indigo-700',
        'Delivered': 'bg-green-100 text-green-700',
        'Cancelled': 'bg-red-100 text-red-700'
      };
      return colors[status] || 'bg-gray-100 text-gray-700';
    };

    const getStatusIcon = (status) => {
      const icons = {
        'Pending': '⏳',
        'Confirmed': '✅',
        'Processing': '📦',
        'In Transit': '🚚',
        'Delivered': '🎉',
        'Cancelled': '❌'
      };
      return icons[status] || '📋';
    };

    const formatTime = (date) => {
      return new Date(date).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const getTimeRemaining = (estimatedDelivery) => {
      if (!estimatedDelivery) return 'Calculating...';
    
      const now = new Date();
      const delivery = new Date(estimatedDelivery);
      const diff = delivery - now;
    
      if (diff < 0) return 'Should arrive soon';
    
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
      if (hours > 0) {
        return `${hours}h ${minutes}m remaining`;
      }
      return `${minutes}m remaining`;
    };

    // Order Detail Modal
    const OrderDetailModal = ({ order, onClose }) => {
      if (!order) return null;

      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">Order #{order._id.slice(-6)}</h2>
                  <p className="text-blue-100 mt-1">Placed on {formatTime(order.orderDate)}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Status Badge & Estimated Delivery */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                  <span className="text-xl">{getStatusIcon(order.status)}</span>
                  {order.status}
                </div>
                {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.estimatedDelivery && (
                  <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full font-semibold flex items-center gap-2">
                    <Calendar size={18} />
                    {getTimeRemaining(order.estimatedDelivery)}
                  </div>
                )}
              </div>

              {/* Order Timeline */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-blue-600" />
                  Order Timeline
                </h3>
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                  {/* Timeline Items */}
                  <div className="space-y-6">
                    {order.statusHistory && order.statusHistory.length > 0 ? (
                      [...order.statusHistory].reverse().map((history, index) => (
                        <div key={index} className="relative pl-16">
                          {/* Timeline Dot */}
                          <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${index === 0 ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-200'
                            }`}>
                            {getStatusIcon(history.status)}
                          </div>
                        
                          {/* Timeline Content */}
                          <div className={`bg-white border-2 ${index === 0 ? 'border-blue-600' : 'border-gray-200'} rounded-lg p-4`}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-lg">{history.status}</h4>
                              <span className="text-sm text-gray-500">{formatTime(history.timestamp)}</span>
                            </div>
                            <p className="text-gray-600">{history.note || `Order ${history.status.toLowerCase()}`}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">No timeline available</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin className="text-blue-600" />
                  Delivery Information
                </h3>
                <div className="space-y-2">
                  <p><strong>Name:</strong> {order.userName}</p>
                  <p><strong>Phone:</strong> {order.userPhone}</p>
                  <p><strong>Address:</strong> {order.userAddress}</p>
                  <p><strong>Payment:</strong> {order.paymentMethod}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{item.image}</span>
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-gray-600">{item.unit} × {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-bold text-lg">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              
                <div className="border-t-2 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total Amount</span>
                    <span className="text-2xl font-bold text-blue-600">₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">My Orders</h2>
        
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-xl text-gray-600 mb-6">No orders yet</p>
              <button onClick={() => setView('products')} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
                  <div className="p-6">
                    {/* Order Header */}
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-xl mb-1">Order #{order._id.slice(-6)}</h3>
                        <p className="text-sm text-gray-600">{formatTime(order.orderDate)}</p>
                      </div>
                      <div className="flex flex-wrap gap-3 items-center">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                          <span className="text-lg">{getStatusIcon(order.status)}</span>
                          {order.status}
                        </span>
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.estimatedDelivery && (
                          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                            {getTimeRemaining(order.estimatedDelivery)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Items Preview */}
                    <div className="mb-4">
                      <div className="flex gap-2 mb-2">
                        {order.items.slice(0, 5).map((item, idx) => (
                          <span key={idx} className="text-2xl">{item.image}</span>
                        ))}
                        {order.items.length > 5 && (
                          <span className="text-gray-500 text-sm self-center">+{order.items.length - 5} more</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Order Footer */}
                    <div className="flex flex-wrap justify-between items-center pt-4 border-t">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-blue-600">₹{order.total}</p>
                      </div>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Package size={18} />
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <Header />
      
      {/* Updated AuthModal */}
      <AuthModal
        showAuth={showAuth}
        authMode={authMode}
        onClose={() => setShowAuth(false)}
        // onSubmit={handleAuth}
        // loading={loading}
      />
      
      {view === 'home' && <HomeView />}
      {view === 'products' && <ProductsView />}
      {view === 'cart' && <CartView />}
      {view === 'orders' && <OrdersView />}
      {view === 'admin-dashboard' && (
        <AdminDashboard
        currentUser={currentUser}
          products={products}
          allOrders={allOrders}
          updateProductPrice={updateProductPrice}
          updateOrderStatus={updateOrderStatus}
          refreshProducts={fetchProducts}
          refreshOrders={fetchAllOrders}
        />
      )}
    </div>
  );
};
export default App;