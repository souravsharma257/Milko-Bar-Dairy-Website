import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, LogOut, Package, Home, Settings, Users, TrendingUp, Menu, X, Plus, Minus, Trash2, MapPin, Phone, Mail, Calendar, Eye, EyeOff, Truck, Search, Star, ShieldCheck, Clock3, Leaf, ArrowRight, Store, Bike, HeartHandshake } from 'lucide-react';
import { authAPI, productsAPI, ordersAPI, vendorAPI, deliveryAPI } from './services/api';
import AuthModal from './AuthModal';
import VendorRegister from './VendorRegister';
import VendorLogin from './VendorLogin';
import VendorDashboard from './VendorDashboard';
import DeliveryRegister from './DeliveryRegister';
import DeliveryLogin from './DeliveryLogin';
import DeliveryDashboard from './DeliveryDashboard';
import LiveTrackingMap from './LiveTrackingMap';

const CATEGORIES = ['All', 'Milk', 'Dahi', 'Paneer', 'Butter', 'Ghee', 'Lassi', 'Buttermilk', 'Ice Cream'];

// =====================================================================
// Reverse geocode lat/lng into a readable "Area, City" name (module-level helper)
// =====================================================================
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    const address = data.address || {};
    const area = address.village || address.town || address.suburb || address.city_district || address.hamlet || '';
    const city = address.city || address.county || '';
    return [area, city].filter(Boolean).join(', ') || 'Location detected';
  } catch (error) {
    return 'Location detected';
  }
};

// =====================================================================
// AdminDashboard (already module-level - unaffected by the remount bug)
// =====================================================================
const AdminDashboard = ({ currentUser }) => {
  const [adminView, setAdminView] = useState('orders');
  const [allOrders, setAllOrders] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [allDeliveryBoys, setAllDeliveryBoys] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getAll();
        setAllOrders(response.data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (adminView === 'vendors') {
      fetchVendors();
    }
    if (adminView === 'delivery') {
      fetchDeliveryBoys();
    }
  }, [adminView]);

  const fetchVendors = async () => {
    try {
      const response = await vendorAPI.getAllVendors();
      setAllVendors(response.data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchDeliveryBoys = async () => {
    try {
      const response = await deliveryAPI.getAllDeliveryBoys();
      setAllDeliveryBoys(response.data || []);
    } catch (error) {
      console.error('Error fetching delivery boys:', error);
    }
  };

  const handleDeliveryBoyStatusUpdate = async (deliveryBoyId, status) => {
    try {
      await deliveryAPI.updateDeliveryBoyStatus(deliveryBoyId, status);
      fetchDeliveryBoys();
      alert(`Delivery partner ${status} successfully!`);
    } catch (error) {
      alert('Failed to update delivery partner status');
    }
  };

  const handleVendorStatusUpdate = async (vendorId, status) => {
    try {
      await vendorAPI.updateVendorStatus(vendorId, status);
      fetchVendors();
      alert(`Vendor ${status} successfully!`);
    } catch (error) {
      alert('Failed to update vendor status');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setAllOrders(prev => prev.map(order =>
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const switchView = (view) => {
    setAdminView(view);
  };

  const getVendorStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'approved': 'bg-green-100 text-green-700',
      'rejected': 'bg-red-100 text-red-700',
      'suspended': 'bg-gray-100 text-gray-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getDeliveryStatusColor = getVendorStatusColor; // same status set, same colors

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex space-x-4 mb-6">
        <button onClick={() => switchView('orders')} className={`px-4 py-2 rounded ${adminView === 'orders' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          Orders
        </button>
        <button onClick={() => switchView('vendors')} className={`px-4 py-2 rounded ${adminView === 'vendors' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          Vendors
        </button>
        <button onClick={() => switchView('delivery')} className={`px-4 py-2 rounded ${adminView === 'delivery' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
          Delivery Partners
        </button>
      </div>

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
                          <option value="Cancelled">❌ Cancelled</option>
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

      {adminView === 'vendors' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-2xl font-bold mb-6">Manage Vendors</h3>
          {allVendors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-xl">No vendor requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left">Dairy Name</th>
                    <th className="px-4 py-3 text-left">Owner</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Area</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allVendors.map(vendor => (
                    <tr key={vendor._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{vendor.dairyName}</td>
                      <td className="px-4 py-3">{vendor.ownerName}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{vendor.phone}</p>
                        <p className="text-xs text-gray-500">{vendor.email}</p>
                      </td>
                      <td className="px-4 py-3">{vendor.area}, {vendor.city}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getVendorStatusColor(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {vendor.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleVendorStatusUpdate(vendor._id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Approve</button>
                            <button onClick={() => handleVendorStatusUpdate(vendor._id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Reject</button>
                          </div>
                        )}
                        {vendor.status === 'approved' && (
                          <button onClick={() => handleVendorStatusUpdate(vendor._id, 'suspended')} className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">Suspend</button>
                        )}
                        {vendor.status === 'suspended' && (
                          <button onClick={() => handleVendorStatusUpdate(vendor._id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Reactivate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {adminView === 'delivery' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-2xl font-bold mb-6">Manage Delivery Partners</h3>
          {allDeliveryBoys.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Truck size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-xl">No delivery partner requests yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Vehicle</th>
                    <th className="px-4 py-3 text-left">Area</th>
                    <th className="px-4 py-3 text-left">Online?</th>
                    <th className="px-4 py-3 text-left">Deliveries</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allDeliveryBoys.map(db => (
                    <tr key={db._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{db.name}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{db.phone}</p>
                        <p className="text-xs text-gray-500">{db.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{db.vehicleType}</p>
                        {db.vehicleNumber && <p className="text-xs text-gray-500">{db.vehicleNumber}</p>}
                      </td>
                      <td className="px-4 py-3">{db.area}, {db.city}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${db.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {db.isOnline ? '🟢 Online' : '⚪ Offline'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{db.totalDeliveries || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDeliveryStatusColor(db.status)}`}>
                          {db.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {db.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleDeliveryBoyStatusUpdate(db._id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Approve</button>
                            <button onClick={() => handleDeliveryBoyStatusUpdate(db._id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Reject</button>
                          </div>
                        )}
                        {db.status === 'approved' && (
                          <button onClick={() => handleDeliveryBoyStatusUpdate(db._id, 'suspended')} className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600">Suspend</button>
                        )}
                        {db.status === 'suspended' && (
                          <button onClick={() => handleDeliveryBoyStatusUpdate(db._id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">Reactivate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// =====================================================================
// LocationPickerModal - module-level (stable identity), map pin + search + GPS
// =====================================================================
const LocationPickerModal = ({ onClose, userCoords, userLocationName, applyManualLocation }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [leafletReady, setLeafletReady] = useState(!!window.L);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerSearching, setPickerSearching] = useState(false);
  const [pickedCoords, setPickedCoords] = useState(userCoords || { lat: 27.8828, lng: 79.9088 }); // fallback: Shahjahanpur
  const [pickedName, setPickedName] = useState(userLocationName || '');
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.L) {
        setLeafletReady(true);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current || mapRef.current) return;

    const L = window.L;
    const map = L.map(mapContainerRef.current).setView([pickedCoords.lat, pickedCoords.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    const marker = L.marker([pickedCoords.lat, pickedCoords.lng], { draggable: true }).addTo(map);

    const updateFromLatLng = async (lat, lng) => {
      setPickedCoords({ lat, lng });
      setPickedName('Looking up address...');
      const name = await reverseGeocode(lat, lng);
      setPickedName(name);
    };

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      updateFromLatLng(pos.lat, pos.lng);
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      updateFromLatLng(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [leafletReady]);

  const moveMapTo = (lat, lng, name) => {
    setPickedCoords({ lat, lng });
    if (name) setPickedName(name);
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  const handlePickerSearch = async () => {
    if (!pickerSearch.trim()) return;
    setPickerSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(pickerSearch)}&limit=1`
      );
      const results = await response.json();
      if (results && results.length > 0) {
        const lat = parseFloat(results[0].lat);
        const lng = parseFloat(results[0].lon);
        moveMapTo(lat, lng, results[0].display_name);
      } else {
        alert('Location not found. Try a more specific address.');
      }
    } catch (error) {
      alert('Could not search location. Please try again.');
    } finally {
      setPickerSearching(false);
    }
  };

  const useMyCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported on this device.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const name = await reverseGeocode(lat, lng);
        moveMapTo(lat, lng, name);
        setGpsLoading(false);
      },
      () => {
        alert('Could not get your current location. Please allow location access or pick manually on the map.');
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const confirmLocation = () => {
    applyManualLocation(pickedCoords.lat, pickedCoords.lng, pickedName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 rounded-t-2xl flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <MapPin size={22} /> Set Your Live Location
          </h2>
          <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition">
            <X size={22} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="🔍 Search area, village, or city..."
              value={pickerSearch}
              onChange={(e) => setPickerSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePickerSearch()}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handlePickerSearch}
              disabled={pickerSearching}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {pickerSearching ? '...' : 'Search'}
            </button>
          </div>

          <button
            onClick={useMyCurrentLocation}
            disabled={gpsLoading}
            className="w-full mb-3 px-4 py-2 bg-green-50 text-green-700 border-2 border-green-200 rounded-lg font-semibold hover:bg-green-100 transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            📍 {gpsLoading ? 'Getting your location...' : 'Use My Current Location (GPS)'}
          </button>

          <p className="text-xs text-gray-500 mb-2">
            Tip: Click anywhere on the map, or drag the pin, to set your exact live location.
          </p>

          <div ref={mapContainerRef} className="w-full rounded-lg border-2 border-gray-200" style={{ height: '320px' }}>
            {!leafletReady && (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                Loading map...
              </div>
            )}
          </div>

          <div className="mt-3 bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
            📍 {pickedName || 'Pick a location on the map above'}
          </div>

          <button
            onClick={confirmLocation}
            className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Confirm This Location
          </button>
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// Header - module-level (stable identity - fixes remount loop)
// =====================================================================
const Header = ({
  currentUser, currentVendor, cart, view, setView,
  userLocationName, showMobileMenu, setShowMobileMenu,
  handleLogout, setShowAuth, setAuthMode, fetchMyOrders,
  onOpenLocationPicker
}) => (
  <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-xl shadow-sm">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="flex min-h-[72px] items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-3 text-left group shrink-0"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-2xl shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
            🥛
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-extrabold tracking-tight text-gray-900 leading-none">
              Milko Bar
            </h1>
            <p className="text-[11px] font-semibold text-blue-600 mt-1">Fresh Dairy • Delivered Fresh</p>
          </div>
        </button>

        {/* Desktop location */}
        <button
          onClick={onOpenLocationPicker}
          className="hidden lg:flex min-w-0 max-w-[250px] items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-gray-50 transition"
        >
          <MapPin size={18} className="text-blue-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Delivering to</p>
            <p className="truncate text-xs font-bold text-gray-800">
              {userLocationName || 'Set your location'}
            </p>
          </div>
          <span className="text-[10px] font-bold text-blue-600 ml-auto">Change</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => setView('home')}
            className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${view === 'home' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            Home
          </button>

          {currentUser?.role === 'customer' && (
            <>
              <button
                onClick={() => setView('products')}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${view === 'products' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                Products
              </button>
              <button
                onClick={() => { setView('orders'); fetchMyOrders(); }}
                className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${view === 'orders' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                My Orders
              </button>
            </>
          )}

          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setView('admin-dashboard')}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Dashboard
            </button>
          )}

          {!currentUser && !currentVendor && (
            <>
              <button
                onClick={() => setView('vendor-login')}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-green-50 hover:text-green-700 transition"
              >
                Vendor
              </button>
              <button
                onClick={() => setView('delivery-login')}
                className="px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-orange-50 hover:text-orange-700 transition"
              >
                Delivery
              </button>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLocationPicker}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
            aria-label="Set location"
          >
            <MapPin size={18} />
          </button>

          {currentUser?.role === 'customer' && (
            <button
              onClick={() => setView('cart')}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
              aria-label="Cart"
            >
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
                  {cart.length}
                </span>
              )}
            </button>
          )}

          {currentUser ? (
            <div className="hidden sm:flex items-center gap-2">
              <div className="hidden lg:flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <User size={17} />
              </div>
              <button
                onClick={handleLogout}
                className="rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-gray-800 transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setShowAuth(true); setAuthMode('login'); }}
              className="rounded-xl bg-blue-600 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition"
            >
              Login
            </button>
          )}

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-700"
            aria-label="Menu"
          >
            {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <nav className="md:hidden border-t border-gray-100 py-4 space-y-1">
          <button onClick={() => { setView('home'); setShowMobileMenu(false); }} className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-blue-50">Home</button>
          {currentUser?.role === 'customer' && (
            <>
              <button onClick={() => { setView('products'); setShowMobileMenu(false); }} className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-blue-50">Products</button>
              <button onClick={() => { setView('orders'); setShowMobileMenu(false); fetchMyOrders(); }} className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-blue-50">My Orders</button>
              <button onClick={() => { setView('cart'); setShowMobileMenu(false); }} className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-blue-50">Cart ({cart.length})</button>
            </>
          )}
          {!currentUser && !currentVendor && (
            <>
              <button onClick={() => { setView('vendor-login'); setShowMobileMenu(false); }} className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-green-50">🏪 Vendor Login</button>
              <button onClick={() => { setView('delivery-login'); setShowMobileMenu(false); }} className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 hover:bg-orange-50">🚴 Delivery Partner</button>
            </>
          )}
          {currentUser && (
            <button onClick={handleLogout} className="w-full rounded-xl px-4 py-3 text-left text-sm font-bold text-red-600 hover:bg-red-50">Logout</button>
          )}
        </nav>
      )}
    </div>
  </header>
);

// =====================================================================
// HomeView - premium grocery/dairy storefront
// =====================================================================
const HomeView = ({ currentUser, setShowAuth, setAuthMode, setView, setSelectedCategory }) => {
  const categories = [
    { name: 'Milk', icon: '🥛', tone: 'from-blue-50 to-white', accent: 'text-blue-700' },
    { name: 'Dahi', icon: '🥣', tone: 'from-purple-50 to-white', accent: 'text-purple-700' },
    { name: 'Paneer', icon: '🧀', tone: 'from-amber-50 to-white', accent: 'text-amber-700' },
    { name: 'Butter', icon: '🧈', tone: 'from-yellow-50 to-white', accent: 'text-yellow-700' },
    { name: 'Ghee', icon: '🫙', tone: 'from-orange-50 to-white', accent: 'text-orange-700' },
    { name: 'Lassi', icon: '🥤', tone: 'from-pink-50 to-white', accent: 'text-pink-700' },
    { name: 'Buttermilk', icon: '🥛', tone: 'from-cyan-50 to-white', accent: 'text-cyan-700' },
    { name: 'Ice Cream', icon: '🍨', tone: 'from-indigo-50 to-white', accent: 'text-indigo-700' },
  ];

  const shop = (category = 'All') => {
    setSelectedCategory(category);
    setView('products');
  };

  return (
    <div className="min-h-screen bg-[#fafbff] text-gray-900">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />

        <div className="container relative mx-auto px-4 lg:px-8">
          <div className="grid min-h-[570px] items-center gap-10 py-12 lg:grid-cols-[1.05fr_.95fr] lg:py-16">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-extrabold text-blue-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Fresh from local dairies
              </div>

              <h2 className="text-5xl font-black leading-[1.02] tracking-tight text-gray-950 sm:text-6xl lg:text-7xl">
                Fresh dairy,
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  delivered fresh.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
                Pure milk, dahi, paneer, butter and more — sourced from trusted local dairies and brought straight to your doorstep.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => shop('All')}
                  className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition"
                >
                  Shop fresh products
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {!currentUser && (
                  <button
                    onClick={() => { setShowAuth(true); setAuthMode('register'); }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-7 py-4 text-sm font-extrabold text-gray-800 shadow-sm hover:border-blue-200 hover:bg-blue-50 transition"
                  >
                    Create account
                  </button>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-gray-500">
                <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-600" /> Quality checked</span>
                <span className="flex items-center gap-2"><Clock3 size={16} className="text-blue-600" /> Quick delivery</span>
                <span className="flex items-center gap-2"><Leaf size={16} className="text-green-600" /> Fresh & pure</span>
              </div>
            </div>

            {/* Hero product composition — no external image dependency */}
            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute left-8 top-10 h-48 w-48 rounded-full bg-blue-200/40 blur-2xl" />
              <div className="absolute bottom-4 right-2 h-44 w-44 rounded-full bg-green-200/40 blur-2xl" />

              <div className="relative rounded-[2.5rem] border border-white bg-white/80 p-5 shadow-2xl shadow-blue-100 backdrop-blur">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex min-h-[235px] items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-100 via-white to-cyan-50">
                    <div className="text-center">
                      <div className="text-8xl drop-shadow-md">🥛</div>
                      <p className="mt-3 text-sm font-black text-gray-800">Fresh Milk</p>
                      <p className="text-xs text-gray-500">Pure • Fresh • Local</p>
                    </div>
                  </div>
                  <div className="flex min-h-[125px] items-center justify-center rounded-3xl bg-gradient-to-br from-amber-50 to-white border border-amber-100">
                    <div className="text-center"><div className="text-5xl">🧀</div><p className="mt-2 text-xs font-extrabold">Paneer</p></div>
                  </div>
                  <div className="flex min-h-[125px] items-center justify-center rounded-3xl bg-gradient-to-br from-green-50 to-white border border-green-100">
                    <div className="text-center"><div className="text-5xl">🥣</div><p className="mt-2 text-xs font-extrabold">Dahi</p></div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-2xl bg-gray-950 px-5 py-4 text-white">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Milko Bar promise</p>
                    <p className="mt-1 text-sm font-extrabold">Freshness at your doorstep</p>
                  </div>
                  <HeartHandshake size={26} className="text-blue-300" />
                </div>
              </div>

              <div className="absolute -right-3 top-8 hidden rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl sm:block">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-50 text-yellow-500"><Star size={16} fill="currentColor" /></div>
                  <div><p className="text-xs font-black">Freshness first</p><p className="text-[10px] text-gray-500">Every order</p></div>
                </div>
              </div>

              <div className="absolute -left-4 bottom-10 hidden rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl sm:block">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🚚</div>
                  <div><p className="text-xs font-black">Doorstep delivery</p><p className="text-[10px] text-gray-500">Local & quick</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-gray-100 bg-white">
        <div className="container mx-auto grid grid-cols-2 divide-x divide-gray-100 px-4 py-5 md:grid-cols-4 lg:px-8">
          {[
            [ShieldCheck, 'Quality assured', 'Trusted dairy products'],
            [Clock3, 'Fast delivery', 'Fresh at your doorstep'],
            [Leaf, 'Fresh & pure', 'Carefully sourced'],
            [HeartHandshake, 'Local partners', 'Growing with dairies'],
          ].map(([Icon, title, subtitle]) => (
            <div key={title} className="flex items-center justify-center gap-3 px-3 py-2">
              <Icon size={22} className="shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-extrabold text-gray-900">{title}</p>
                <p className="hidden text-[10px] text-gray-500 sm:block">{subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-600">Shop by category</p>
            <h3 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">What are you craving?</h3>
          </div>
          <button onClick={() => shop('All')} className="hidden items-center gap-1 text-sm font-extrabold text-blue-600 sm:flex">
            View all <ChevronRightIcon />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => shop(cat.name)}
              className={`group rounded-3xl border border-gray-100 bg-gradient-to-b ${cat.tone} p-4 text-center shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all`}
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-5xl shadow-sm group-hover:scale-105 transition-transform">
                {cat.icon}
              </div>
              <p className={`mt-3 text-xs font-extrabold ${cat.accent}`}>{cat.name}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Marketplace banner */}
      <section className="container mx-auto px-4 pb-16 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-gray-950 via-gray-900 to-blue-950 p-8 text-white shadow-2xl sm:p-12">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-blue-200">Milko Bar marketplace</span>
              <h3 className="mt-4 max-w-2xl text-3xl font-black sm:text-4xl">One place for your everyday dairy.</h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-300">Discover products from nearby dairy partners and get them delivered without the hassle.</p>
            </div>
            <button onClick={() => shop('All')} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-extrabold text-gray-900 hover:bg-blue-50 transition">
              Explore products <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* Partner cards */}
      <section className="bg-white border-y border-gray-100">
        <div className="container mx-auto grid gap-5 px-4 py-16 md:grid-cols-2 lg:px-8">
          <div className="group overflow-hidden rounded-[2rem] border border-green-100 bg-gradient-to-br from-green-50 to-white p-8 shadow-sm hover:shadow-xl transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600 text-white shadow-lg shadow-green-100">
                <Store size={26} />
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-green-700 shadow-sm">FOR DAIRY OWNERS</span>
            </div>
            <h3 className="mt-7 text-2xl font-black">Grow your dairy with Milko Bar.</h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600">List your fresh products, reach nearby customers and grow your local business online.</p>
            <button onClick={() => setView('vendor-register')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-green-700 transition">
              Become a vendor <ArrowRight size={16} />
            </button>
          </div>

          <div className="group overflow-hidden rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-8 shadow-sm hover:shadow-xl transition">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-100">
                <Bike size={26} />
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-orange-700 shadow-sm">FOR DELIVERY PARTNERS</span>
            </div>
            <h3 className="mt-7 text-2xl font-black">Deliver with Milko Bar.</h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600">Accept nearby orders, deliver locally and earn on your own schedule.</p>
            <button onClick={() => setView('delivery-register')} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-extrabold text-white hover:bg-orange-600 transition">
              Join as delivery partner <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Contact footer */}
      <footer className="bg-gray-950 text-white">
        <div className="container mx-auto px-4 py-12 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-2xl">🥛</div>
                <div>
                  <p className="text-lg font-black">Milko Bar Dairy</p>
                  <p className="text-xs text-gray-400">Fresh dairy. Delivered fresh.</p>
                </div>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-6 text-gray-400">Connecting local dairies with families through a simple, reliable and fresh dairy shopping experience.</p>
            </div>

            <div>
              <p className="text-sm font-extrabold">Quick links</p>
              <div className="mt-4 space-y-3 text-sm text-gray-400">
                <button onClick={() => setView('home')} className="block hover:text-white">Home</button>
                <button onClick={() => shop('All')} className="block hover:text-white">Products</button>
                <button onClick={() => setView('vendor-register')} className="block hover:text-white">Become a Vendor</button>
                <button onClick={() => setView('delivery-register')} className="block hover:text-white">Delivery Partner</button>
              </div>
            </div>

            <div>
              <p className="text-sm font-extrabold">Contact us</p>
              <div className="mt-4 space-y-4 text-sm text-gray-400">
                <p className="flex items-center gap-3"><Phone size={16} /> +91 9358634955</p>
                <p className="flex items-center gap-3"><Mail size={16} /> milkobardairy@gmail.com</p>
                <p className="flex items-center gap-3"><MapPin size={16} /> Nimrana, Rajasthan</p>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} Milko Bar Dairy. Freshness delivered with care.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Small local icon component keeps the category section dependency-free.
const ChevronRightIcon = () => <ArrowRight size={15} />;

// =====================================================================
// ProductsView - module-level. Location comes from App via props;
// this fixes both the remount-loop AND lets the map picker drive it.
// =====================================================================
const ProductsView = ({
  filteredProducts, loading, fetchProducts,
  selectedCategory, setSelectedCategory,
  cart, addToCart,
  userCoords, userLocationName, locationStatus, onOpenLocationPicker
}) => {
  const [addedFeedback, setAddedFeedback] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [nearbyVendorIds, setNearbyVendorIds] = useState(null);
  const [vendorDistances, setVendorDistances] = useState({});
  const [selectedVendorId, setSelectedVendorId] = useState('all');
  const [availableVendors, setAvailableVendors] = useState([]);

  const fetchNearbyForLocation = async (lat, lng) => {
    try {
      const response = await vendorAPI.getNearbyVendors(lat, lng);
      if (response.locationUsed) {
        const ids = response.data.map(v => v._id);
        setNearbyVendorIds(ids);
        setAvailableVendors(response.data);

        const distMap = {};
        response.data.forEach(v => {
          distMap[v._id] = {
            distance: v.distance,
            estimatedTimeText: v.estimatedTimeText,
            estimatedMinutes: v.estimatedMinutes,
            dairyName: v.dairyName
          };
        });
        setVendorDistances(distMap);
      }
    } catch (error) {
      console.error('Error fetching nearby vendors:', error);
    }
  };

  // React ONLY to actual location changes (set once by App-level GPS/map picker),
  // not to every unrelated re-render - this is what fixes the repeated-fetch bug.
  useEffect(() => {
    if (userCoords && userCoords.lat && userCoords.lng) {
      fetchNearbyForLocation(userCoords.lat, userCoords.lng);
    }
  }, [userCoords]);

  if (!filteredProducts || !Array.isArray(filteredProducts)) {
    return <div>Loading...</div>;
  }

  const applyFilters = async () => {
    await fetchProducts({ category: selectedCategory, search: searchTerm, minPrice, maxPrice, sort: sortBy });
  };

  const resetFilters = async () => {
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('');
    setSelectedCategory('All');
    await fetchProducts({ category: 'All' });
  };

  const handleAddToCart = (product, estimatedMinutes) => {
    const vendorInfo = vendorDistances[product.vendor?._id || product.vendor];
    addToCart({
      ...product,
      estimatedMinutes,
      estimatedTimeTextDisplay: vendorInfo?.estimatedTimeText,
      vendorNameDisplay: vendorInfo?.dairyName || product.vendor?.dairyName
    });
    setAddedFeedback(prev => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedFeedback(prev => ({ ...prev, [product._id]: false }));
    }, 1000);
  };

  const isInCart = (productId) => cart.some(item => item._id === productId);
  const cartQuantity = (productId) => cart.find(item => item._id === productId)?.quantity || 0;

  let displayProducts = nearbyVendorIds
    ? filteredProducts.filter(p => !p.vendor || nearbyVendorIds.includes(p.vendor._id || p.vendor))
    : filteredProducts;

  if (selectedVendorId !== 'all') {
    displayProducts = displayProducts.filter(p => (p.vendor?._id || p.vendor) === selectedVendorId);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">Our Products</h2>

        {locationStatus === 'loading' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            📍 Detecting your location for nearby vendors...
          </div>
        )}
        {locationStatus === 'success' && nearbyVendorIds && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between flex-wrap gap-2">
            <span>✅ Showing products from vendors near {userLocationName || 'you'}</span>
            <button onClick={onOpenLocationPicker} className="text-sm underline">Change Location</button>
          </div>
        )}
        {(locationStatus === 'denied' || locationStatus === 'unsupported' || locationStatus === 'idle') && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6 flex items-center justify-between flex-wrap gap-2">
            <span>⚠️ Location not set. Showing all products.</span>
            <button onClick={onOpenLocationPicker} className="text-sm underline">Set Location on Map</button>
          </div>
        )}

        {availableVendors.length >= 2 && (
          <div className="bg-white border-2 border-blue-200 rounded-lg p-4 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">🏪 Choose a Dairy Vendor</label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedVendorId('all')}
                className={`px-5 py-2 rounded-full font-semibold transition ${selectedVendorId === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
              >
                All Vendors
              </button>
              {availableVendors.map(vendor => (
                <button
                  key={vendor._id}
                  onClick={() => setSelectedVendorId(vendor._id)}
                  className={`px-5 py-2 rounded-full font-semibold transition flex items-center gap-2 ${selectedVendorId === vendor._id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-50'}`}
                >
                  🏪 {vendor.dairyName}
                  <span className="text-xs opacity-80">({vendor.distance} km · {vendor.estimatedTimeText})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
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
            <button onClick={() => setShowFilters(!showFilters)} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button onClick={applyFilters} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
              Search
            </button>
          </div>

          {showFilters && (
            <div className="border-t pt-4 mt-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
                  <input type="number" placeholder="₹ 0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                  <input type="number" placeholder="₹ 1000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={resetFilters} className="w-full px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition">Reset Filters</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {CATEGORIES.map(cat => (
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

        <div className="mb-4">
          <p className="text-gray-600">Showing <span className="font-bold text-blue-600">{displayProducts.length}</span> products</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔄</div>
            <p className="text-xl text-gray-600">Loading products...</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-2xl font-bold text-gray-800 mb-2">No products found</p>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <button onClick={resetFilters} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayProducts.map(product => {
              const inCart = isInCart(product._id);
              const qty = cartQuantity(product._id);
              const showAdded = addedFeedback[product._id];
              const isOutOfStock = product.stock === 0;
              const productImage = product.imageUrl
                ? `${process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://milko-bar-dairy-website.onrender.com'}${product.imageUrl}`
                : product.image;

              return (
                <div key={product._id} className="group bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100">
                  <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-white p-8 text-center h-48 flex items-center justify-center relative">
                    {isOutOfStock && (
                      <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">SOLD OUT</span>
                    )}
                    {product.imageUrl ? (
                      <img
                        src={productImage}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="text-7xl group-hover:scale-110 transition-transform duration-300">{product.image}</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.unit}</p>
                    {product.vendor && (
                      <p className="text-xs text-green-600 mb-2 flex items-center gap-2 flex-wrap">
                        <span>🏪 {product.vendor.dairyName || 'Local Vendor'}</span>
                        {vendorDistances[product.vendor._id || product.vendor] && (
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            📍 {vendorDistances[product.vendor._id || product.vendor].distance} km · ⏱️ {vendorDistances[product.vendor._id || product.vendor].estimatedTimeText}
                          </span>
                        )}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-blue-600">₹{product.price}</span>
                      <span className={`text-sm font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-500'}`}>
                        {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
                      </span>
                    </div>
                    <button
                      onClick={() => !isOutOfStock && handleAddToCart(product, vendorDistances[product.vendor?._id || product.vendor]?.estimatedMinutes)}
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
                      {isOutOfStock ? 'Out of Stock' : showAdded ? 'Added! 🎉' : inCart ? `Added (${qty})` : 'Add to Cart'}
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

// =====================================================================
// CartView - module-level
// =====================================================================
const CartView = ({ cart, updateCartQuantity, removeFromCart, cartTotal, placeOrder, loading, setView }) => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="container mx-auto px-4 max-w-4xl">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Shopping Cart</h2>
      {cart.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <ShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-600 mb-6">Your cart is empty</p>
          <button onClick={() => setView('products')} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Continue Shopping</button>
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
                  <button onClick={() => updateCartQuantity(item._id, -1)} className="bg-gray-200 hover:bg-gray-300 p-2 rounded"><Minus size={16} /></button>
                  <span className="font-bold w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item._id, 1)} className="bg-gray-200 hover:bg-gray-300 p-2 rounded"><Plus size={16} /></button>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{item.price * item.quantity}</p>
                  <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 text-sm mt-1"><Trash2 size={16} /></button>
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
              <button onClick={() => placeOrder('COD')} disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400">
                {loading ? 'Processing...' : 'Place Order - Cash on Delivery'}
              </button>
              <button onClick={() => placeOrder('Online')} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400">
                {loading ? 'Processing...' : 'Place Order - Pay Online'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  </div>
);

// =====================================================================
// OrdersView - module-level
// =====================================================================
const OrdersView = ({ orders, setView, fetchMyOrders }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Auto-refresh order list every 15s so status/delivery-boy updates show
  // up live, without the customer needing to manually refresh (Swiggy-style)
  useEffect(() => {
    if (!fetchMyOrders) return;
    const interval = setInterval(fetchMyOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchMyOrders]);

  // Keep an open Track Order modal's data fresh when the list refreshes
  useEffect(() => {
    if (!selectedOrder || !Array.isArray(orders)) return;
    const updated = orders.find(o => o._id === selectedOrder._id);
    if (updated && updated !== selectedOrder) {
      setSelectedOrder(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  if (!Array.isArray(orders)) {
    return <div>Loading orders...</div>;
  }

  const getStatusColor = (status) => ({
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Confirmed': 'bg-blue-100 text-blue-700',
    'Processing': 'bg-purple-100 text-purple-700',
    'In Transit': 'bg-indigo-100 text-indigo-700',
    'Delivered': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700'
  }[status] || 'bg-gray-100 text-gray-700');

  const getStatusIcon = (status) => ({
    'Pending': '⏳', 'Confirmed': '✅', 'Processing': '📦', 'In Transit': '🚚', 'Delivered': '🎉', 'Cancelled': '❌'
  }[status] || '📋');

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const timePart = d.toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today, ${timePart}`;
    if (isYesterday) return `Yesterday, ${timePart}`;
    return d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getTimeRemaining = (estimatedDelivery) => {
    if (!estimatedDelivery) return 'Calculating...';
    const now = new Date();
    const delivery = new Date(estimatedDelivery);
    const diff = delivery - now;
    if (diff < 0) return 'Should arrive soon';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m remaining`;
  };

  const OrderDetailModal = ({ order, onClose }) => {
    const [liveTrackingData, setLiveTrackingData] = useState(null);
    const canLiveTrack = order && order.deliveryBoy && order.status !== 'Delivered' && order.status !== 'Cancelled';

    useEffect(() => {
      if (!canLiveTrack) {
        setLiveTrackingData(null);
        return;
      }
      const fetchTrack = async () => {
        try {
          const res = await deliveryAPI.trackOrder(order._id);
          setLiveTrackingData(res.data);
        } catch (error) {
          console.error('Error fetching live tracking:', error);
        }
      };
      fetchTrack();
      const interval = setInterval(fetchTrack, 8000);
      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canLiveTrack, order?._id]);

    if (!order) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Order #{order._id.slice(-6)}</h2>
                {order.vendor && <p className="text-blue-100 text-sm mb-1">🏪 {order.vendor.dairyName}</p>}
                {order.deliveryBoy && <p className="text-blue-100 text-sm mb-1">🚴 {order.deliveryBoy.name} · {order.deliveryBoy.vehicleType}{order.deliveryBoy.vehicleNumber ? ` (${order.deliveryBoy.vehicleNumber})` : ''}</p>}
                <p className="text-blue-100 mt-1">Placed on {formatTime(order.orderDate)}</p>
              </div>
              <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"><X size={24} /></button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                <span className="text-xl">{getStatusIcon(order.status)}</span>{order.status}
              </div>
              {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.estimatedDelivery && (
                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full font-semibold flex items-center gap-2">
                  <Calendar size={18} />{getTimeRemaining(order.estimatedDelivery)}
                </div>
              )}
            </div>

            {order.deliveryBoy && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-5 mb-6">
                <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">🚴 Your Delivery Partner</h3>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-lg font-bold text-gray-800">{order.deliveryBoy.name}</p>
                    <p className="text-sm text-gray-600">
                      {order.deliveryBoy.vehicleType}{order.deliveryBoy.vehicleNumber ? ` · ${order.deliveryBoy.vehicleNumber}` : ''}
                    </p>
                    <p className="text-sm text-gray-600">📞 {order.deliveryBoy.phone}</p>
                    {order.deliveryBoy.email && <p className="text-sm text-gray-600">✉️ {order.deliveryBoy.email}</p>}
                    {order.deliveryBoyAcceptedAt && (
                      <p className="text-xs text-gray-500 mt-1">Picked up your order at {formatTime(order.deliveryBoyAcceptedAt)}</p>
                    )}
                  </div>
                  <a
                    href={`tel:${order.deliveryBoy.phone}`}
                    className="px-5 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition flex items-center gap-2"
                  >
                    <Phone size={16} /> Call Now
                  </a>
                </div>
                {canLiveTrack && liveTrackingData?.deliveryBoy && (
                  <p className="text-xs text-orange-700 mt-3">
                    📍 {order.status === 'In Transit' ? 'Currently on the way — live location shown below' : 'Heading to pick up your order — live location shown below'}
                  </p>
                )}
              </div>
            )}

            {canLiveTrack && liveTrackingData ? (
              <div className="bg-white border-2 border-blue-100 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">🚴 Live Tracking</h3>
                <LiveTrackingMap
                  pickup={liveTrackingData.pickup}
                  drop={liveTrackingData.drop}
                  deliveryBoyPosition={liveTrackingData.deliveryBoy}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Updates automatically every few seconds</p>
              </div>
            ) : (
              order.vendor && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                <div className="bg-white border-2 border-blue-100 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">🚴 Delivery Route</h3>
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="text-4xl mb-1">🏪</div>
                      <p className="text-sm font-semibold">{order.vendor.dairyName}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-2">
                      <div className="text-3xl animate-pulse">🚴</div>
                      {(order.distance || order.estimatedMinutes) && (
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          {order.distance ? `${order.distance} km` : ''}
                          {order.distance && order.estimatedMinutes ? ' · ' : ''}
                          {order.estimatedMinutes ? `${order.estimatedMinutes} min` : ''}
                        </p>
                      )}
                      <div className="w-full border-t-2 border-dashed border-blue-300 mt-2"></div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-4xl mb-1">🏠</div>
                      <p className="text-sm font-semibold">Your Home</p>
                    </div>
                  </div>
                  {!order.deliveryBoy && (
                    <p className="text-xs text-gray-400 mt-3 text-center">Live tracking will appear once a delivery partner picks up your order.</p>
                  )}
                </div>
              )
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="text-blue-600" />Order Timeline</h3>
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-6">
                  {order.statusHistory && order.statusHistory.length > 0 ? (
                    [...order.statusHistory].reverse().map((history, index) => (
                      <div key={index} className="relative pl-16">
                        <div className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${index === 0 ? 'bg-blue-600 text-white animate-pulse' : 'bg-gray-200'}`}>
                          {getStatusIcon(history.status)}
                        </div>
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

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MapPin className="text-blue-600" />Delivery Information</h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {order.userName}</p>
                <p><strong>Phone:</strong> {order.userPhone}</p>
                <p><strong>Address:</strong> {order.userAddress}</p>
                <p><strong>Payment:</strong> {order.paymentMethod}</p>
              </div>
            </div>

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
            <button onClick={() => setView('products')} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Start Shopping</button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="font-bold text-xl mb-1">Order #{order._id.slice(-6)}</h3>
                      {order.vendor && <p className="text-sm text-green-600 font-medium mb-1">🏪 {order.vendor.dairyName}</p>}
                      <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" /> {formatTime(order.orderDate)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(order.status)}`}>
                        <span className="text-lg">{getStatusIcon(order.status)}</span>{order.status}
                      </span>
                      {order.status !== 'Delivered' && order.status !== 'Cancelled' && order.estimatedDelivery && (
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">{getTimeRemaining(order.estimatedDelivery)}</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex gap-2 mb-2">
                      {order.items.slice(0, 5).map((item, idx) => (<span key={idx} className="text-2xl">{item.image}</span>))}
                      {order.items.length > 5 && (<span className="text-gray-500 text-sm self-center">+{order.items.length - 5} more</span>)}
                    </div>
                    <p className="text-sm text-gray-600">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
                  </div>

                  {order.deliveryBoy && order.status === 'In Transit' && (
                    <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                      </span>
                      <p className="text-sm text-orange-800 font-medium">
                        🚴 {order.deliveryBoy.name} is on the way — tap Track Order for live location
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-blue-600">₹{order.total}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(order)} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                      <Package size={18} />Track Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedOrder && (<OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />)}
    </div>
  );
};

// =====================================================================
// Main App Component - now just orchestrates state + passes props down.
// No more nested component definitions => no more remount loop.
// =====================================================================
const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentVendor, setCurrentVendor] = useState(null);
  const [currentDeliveryBoy, setCurrentDeliveryBoy] = useState(null);
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [userLocationName, setUserLocationName] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    try {
      const storedUser = authAPI.getStoredUser();
      if (storedUser) {
        setCurrentUser(storedUser);
        if (storedUser.role === 'customer') {
          fetchMyOrders();
        } else if (storedUser.role === 'admin') {
          fetchAllOrders();
        }
      }
      const storedVendor = vendorAPI.getStoredVendor();
      if (storedVendor) {
        setCurrentVendor(storedVendor);
      }
      const storedDeliveryBoy = deliveryAPI.getStoredDeliveryBoy();
      if (storedDeliveryBoy) {
        setCurrentDeliveryBoy(storedDeliveryBoy);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('user');
    }
    fetchProducts();
    detectHeaderLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // GPS-based detection - runs once on load, and can be re-triggered from the picker
  const detectHeaderLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }
    setLocationStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const name = await reverseGeocode(lat, lng);
        setUserCoords({ lat, lng });
        setUserLocationName(name);
        setLocationStatus('success');
      },
      () => {
        setLocationStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Single source of truth for location app-wide (used by map picker + GPS)
  const applyManualLocation = (lat, lng, knownName) => {
    setUserCoords({ lat, lng });
    setUserLocationName(knownName || '');
    setLocationStatus('success');
  };

  const fetchProducts = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll(filters);
      setProducts(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const response = await ordersAPI.getMyOrders();
      const ordersData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const fetchAllOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      setAllOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching all orders:', error);
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        handleLogout();
      }
    }
  };

  const handleAuth = async (formData, mode) => {
    setLoading(true);
    try {
      let userData;
      if (mode === 'login') {
        userData = await authAPI.login({ email: formData.email, password: formData.password });
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

  const handleLogout = () => {
    authAPI.logout();
    setCurrentUser(null);
    setCart([]);
    setOrders([]);
    setAllOrders([]);
    setView('home');
  };

  const handleVendorLoginSuccess = (vendorData) => {
    setCurrentVendor(vendorData);
    setView('vendor-dashboard');
  };

  const handleVendorLogout = () => {
    vendorAPI.logout();
    setCurrentVendor(null);
    setView('home');
  };

  const handleDeliveryLoginSuccess = (deliveryData) => {
    setCurrentDeliveryBoy(deliveryData);
    setView('delivery-dashboard');
  };

  const handleDeliveryLogout = () => {
    deliveryAPI.logout();
    setCurrentDeliveryBoy(null);
    setView('home');
  };

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
      const userName = currentUser.fullName ||
        `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() ||
        currentUser.name || 'Customer';
      const userPhone = currentUser.phone || currentUser.userPhone || '';
      const userAddress = currentUser.address || currentUser.userAddress || '';

      const orderData = {
        userName,
        userPhone,
        userAddress,
        items: cart.map(item => ({
          product: item._id, name: item.name, price: item.price, unit: item.unit, quantity: item.quantity, image: item.image
        })),
        total: cartTotal,
        paymentMethod,
        estimatedMinutes: cart[0]?.estimatedMinutes || null
      };

      // Attach customer's live location so delivery boys can see distance/direction
      if (userCoords && userCoords.lat && userCoords.lng) {
        orderData.latitude = userCoords.lat;
        orderData.longitude = userCoords.lng;
      }

      const orderVendorName = cart[0]?.vendorNameDisplay || cart[0]?.vendor?.dairyName || null;
      const orderEstimatedTimeText = cart[0]?.estimatedTimeTextDisplay || null;

      await ordersAPI.create(orderData);

      setCart([]);
      await fetchMyOrders();
      await fetchProducts();
      setView('orders');

      const successLines = ['Order placed successfully! ✅'];
      if (orderVendorName) successLines.push(`🏪 Vendor: ${orderVendorName}`);
      if (orderEstimatedTimeText) successLines.push(`⏱️ Estimated delivery: ${orderEstimatedTimeText}`);
      alert(successLines.join('\n'));
    } catch (error) {
      console.error('Order error:', error);
      alert(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const updateProductPrice = async (productId, newPrice) => {
    await productsAPI.updatePrice(productId, parseFloat(newPrice));
    await fetchProducts();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    await ordersAPI.updateStatus(orderId, newStatus);
    await fetchAllOrders();
  };

  const filteredProducts = selectedCategory === 'All' ? products : products.filter(p => p.category === selectedCategory);

  if (view === 'vendor-register') {
    return <VendorRegister onBackToHome={() => setView('home')} onSwitchToLogin={() => setView('vendor-login')} />;
  }

  if (view === 'vendor-login') {
    return (
      <VendorLogin
        onLoginSuccess={handleVendorLoginSuccess}
        onBackToHome={() => setView('home')}
        onSwitchToRegister={() => setView('vendor-register')}
      />
    );
  }

  if (view === 'vendor-dashboard' && currentVendor) {
    return <VendorDashboard vendor={currentVendor} onLogout={handleVendorLogout} />;
  }

  if (view === 'delivery-register') {
    return <DeliveryRegister onBackToHome={() => setView('home')} onSwitchToLogin={() => setView('delivery-login')} />;
  }

  if (view === 'delivery-login') {
    return (
      <DeliveryLogin
        onLoginSuccess={handleDeliveryLoginSuccess}
        onBackToHome={() => setView('home')}
        onSwitchToRegister={() => setView('delivery-register')}
      />
    );
  }

  if (view === 'delivery-dashboard' && currentDeliveryBoy) {
    return <DeliveryDashboard deliveryBoy={currentDeliveryBoy} onLogout={handleDeliveryLogout} />;
  }

  return (
    <div className="App">
      <Header
        currentUser={currentUser}
        currentVendor={currentVendor}
        cart={cart}
        view={view}
        setView={setView}
        userLocationName={userLocationName}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        handleLogout={handleLogout}
        setShowAuth={setShowAuth}
        setAuthMode={setAuthMode}
        fetchMyOrders={fetchMyOrders}
        onOpenLocationPicker={() => setShowLocationPicker(true)}
      />

      <AuthModal
        showAuth={showAuth}
        authMode={authMode}
        onClose={() => setShowAuth(false)}
        onSubmit={handleAuth}
        loading={loading}
      />

      {showLocationPicker && (
        <LocationPickerModal
          onClose={() => setShowLocationPicker(false)}
          userCoords={userCoords}
          userLocationName={userLocationName}
          applyManualLocation={applyManualLocation}
        />
      )}

      {view === 'home' && (
        <HomeView
          currentUser={currentUser}
          setShowAuth={setShowAuth}
          setAuthMode={setAuthMode}
          setView={setView}
          setSelectedCategory={setSelectedCategory}
        />
      )}

      {view === 'products' && (
        <ProductsView
          filteredProducts={filteredProducts}
          loading={loading}
          fetchProducts={fetchProducts}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          cart={cart}
          addToCart={addToCart}
          userCoords={userCoords}
          userLocationName={userLocationName}
          locationStatus={locationStatus}
          onOpenLocationPicker={() => setShowLocationPicker(true)}
        />
      )}

      {view === 'cart' && (
        <CartView
          cart={cart}
          updateCartQuantity={updateCartQuantity}
          removeFromCart={removeFromCart}
          cartTotal={cartTotal}
          placeOrder={placeOrder}
          loading={loading}
          setView={setView}
        />
      )}

      {view === 'orders' && (
        <OrdersView orders={orders} setView={setView} fetchMyOrders={fetchMyOrders} />
      )}

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