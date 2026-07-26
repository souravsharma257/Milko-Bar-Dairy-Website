import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, DollarSign, LogOut, Plus, Edit2, Trash2, X } from 'lucide-react';
import { vendorAPI } from './services/api';

const VendorDashboard = ({ vendor, onLogout }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState({ totalOrders: 0, totalEarning: 0, commissionRate: 10 });
  const [loading, setLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [productForm, setProductForm] = useState({
    name: '', category: 'Milk', price: '', unit: '', image: '🥛', stock: ''
  });

  const categories = ['Milk', 'Dahi', 'Paneer', 'Butter', 'Ghee', 'Lassi', 'Buttermilk', 'Ice Cream'];

  useEffect(() => {
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'earnings') fetchEarnings();
  }, [activeTab]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getProducts();
      setProducts(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarnings = async () => {
    try {
      const response = await vendorAPI.getEarnings();
      setEarnings(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...productForm, price: parseFloat(productForm.price), stock: parseInt(productForm.stock) };
      if (editingProduct) {
        await vendorAPI.updateProduct(editingProduct._id, data);
      } else {
        await vendorAPI.createProduct(data);
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductForm({ name: '', category: 'Milk', price: '', unit: '', image: '🥛', stock: '' });
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name, category: product.category, price: product.price,
      unit: product.unit, image: product.image, stock: product.stock
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product?')) {
      try {
        await vendorAPI.deleteProduct(id);
        fetchProducts();
      } catch (error) {
        alert('Failed to delete product');
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await vendorAPI.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (error) {
      alert('Failed to update order');
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">{vendor.dairyName}</h1>
            <p className="text-sm text-blue-200">{vendor.area}, {vendor.city}</p>
          </div>
          <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg flex items-center gap-2">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex gap-4">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            <Package size={18} /> My Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            <ShoppingBag size={18} /> Orders
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 ${activeTab === 'earnings' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
          >
            <DollarSign size={18} /> Earnings
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">My Products</h3>
              <button
                onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name: '', category: 'Milk', price: '', unit: '', image: '🥛', stock: '' }); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus size={18} /> Add Product
              </button>
            </div>

            {products.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No products yet. Add your first product!</p>
            ) : (
              <div className="grid md:grid-cols-3 gap-4">
                {products.map(p => (
                  <div key={p._id} className="border rounded-lg p-4">
                    <div className="text-4xl mb-2">{p.image}</div>
                    <h4 className="font-bold">{p.name}</h4>
                    <p className="text-sm text-gray-600">{p.unit} | {p.category}</p>
                    <p className="text-blue-600 font-bold">₹{p.price}</p>
                    <p className="text-sm text-gray-500">Stock: {p.stock}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => handleEditProduct(p)} className="flex-1 bg-blue-50 text-blue-600 py-1 rounded flex items-center justify-center gap-1">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(p._id)} className="flex-1 bg-red-50 text-red-600 py-1 rounded flex items-center justify-center gap-1">
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold mb-6">My Orders</h3>
            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map(o => (
                  <div key={o._id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold">Order #{o._id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">{o.userName} - {o.userPhone}</p>
                      </div>
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(o.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                    <p className="text-sm text-gray-600">{o.userAddress}</p>
                    <p className="font-bold text-blue-600 mt-2">Total: ₹{o.total}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
              <p className="text-blue-100 mb-1">Total Orders</p>
              <p className="text-3xl font-bold">{earnings.totalOrders}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
              <p className="text-green-100 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold">₹{earnings.totalEarning}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6">
              <p className="text-purple-100 mb-1">Commission Rate</p>
              <p className="text-3xl font-bold">{earnings.commissionRate}%</p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full relative">
            <button onClick={() => setShowProductForm(false)} className="absolute top-4 right-4">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
            <form onSubmit={handleProductSubmit} className="space-y-3">
              <input
                type="text" placeholder="Product Name" value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                className="w-full p-3 border rounded-lg" required
              />
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="w-full p-3 border rounded-lg"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number" placeholder="Price (₹)" value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="w-full p-3 border rounded-lg" required
                />
                <input
                  type="text" placeholder="Unit (e.g. 1L)" value={productForm.unit}
                  onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                  className="w-full p-3 border rounded-lg" required
                />
              </div>
              <input
                type="number" placeholder="Stock Quantity" value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                className="w-full p-3 border rounded-lg" required
              />
              <input
                type="text" placeholder="Emoji (e.g. 🥛)" value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                className="w-full p-3 border rounded-lg"
              />
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;