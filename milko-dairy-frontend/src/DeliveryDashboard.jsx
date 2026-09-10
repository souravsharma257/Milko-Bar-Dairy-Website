import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Truck, LogOut, Package, MapPin, Phone, Navigation, DollarSign, RefreshCw } from 'lucide-react';
import { deliveryAPI } from './services/api';
import LiveTrackingMap from './LiveTrackingMap';

const DeliveryDashboard = ({ deliveryBoy, onLogout }) => {
  const [profile, setProfile] = useState(deliveryBoy);
  const [tab, setTab] = useState('available'); // available | mydeliveries
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [myPosition, setMyPosition] = useState(null);
  const [earnings, setEarnings] = useState(null);

  const isOnline = profile.isOnline;

  const fetchAvailableOrders = useCallback(async () => {
    try {
      const res = await deliveryAPI.getAvailableOrders();
      setAvailableOrders(res.data || []);
    } catch (error) {
      console.error('Error fetching available orders:', error);
    }
  }, []);

  const fetchMyDeliveries = useCallback(async () => {
    try {
      const res = await deliveryAPI.getMyDeliveries();
      setMyDeliveries(res.data || []);
    } catch (error) {
      console.error('Error fetching my deliveries:', error);
    }
  }, []);

  const fetchEarnings = useCallback(async () => {
    try {
      const res = await deliveryAPI.getEarnings();
      setEarnings(res.data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMyDeliveries();
    fetchEarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll available orders every 8s while online and on that tab
  useEffect(() => {
    if (!isOnline || tab !== 'available') return;
    fetchAvailableOrders();
    const interval = setInterval(fetchAvailableOrders, 8000);
    return () => clearInterval(interval);
  }, [isOnline, tab, fetchAvailableOrders]);

  // Poll my deliveries every 10s on that tab
  useEffect(() => {
    if (tab !== 'mydeliveries') return;
    fetchMyDeliveries();
    const interval = setInterval(fetchMyDeliveries, 10000);
    return () => clearInterval(interval);
  }, [tab, fetchMyDeliveries]);

  // Send my live GPS to the backend every 12s while online, so customers
  // and the tracking map can see where I am
  useEffect(() => {
    if (!isOnline || !navigator.geolocation) return;

    const sendLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMyPosition({ lat, lng });
          deliveryAPI.updateLocation(lat, lng).catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    };

    sendLocation();
    const interval = setInterval(sendLocation, 12000);
    return () => clearInterval(interval);
  }, [isOnline]);

  // Poll the tracking data of the order currently being tracked
  useEffect(() => {
    if (!trackingOrderId) {
      setTrackingData(null);
      return;
    }
    const fetchTrack = async () => {
      try {
        const res = await deliveryAPI.trackOrder(trackingOrderId);
        setTrackingData(res.data);
      } catch (error) {
        console.error('Error tracking order:', error);
      }
    };
    fetchTrack();
    const interval = setInterval(fetchTrack, 6000);
    return () => clearInterval(interval);
  }, [trackingOrderId]);

  const handleToggleOnline = async () => {
    setToggling(true);
    try {
      const res = await deliveryAPI.toggleOnline();
      setProfile(prev => ({ ...prev, isOnline: res.isOnline }));
      if (res.isOnline) fetchAvailableOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Could not update availability');
    } finally {
      setToggling(false);
    }
  };

  const handleAccept = async (orderId) => {
    setLoading(true);
    try {
      await deliveryAPI.acceptOrder(orderId);
      alert('Order accepted! Head to the vendor to pick it up.');
      await fetchAvailableOrders();
      await fetchMyDeliveries();
      setTab('mydeliveries');
    } catch (error) {
      alert(error.response?.data?.message || 'Could not accept this order');
      fetchAvailableOrders();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    setLoading(true);
    try {
      await deliveryAPI.updateDeliveryStatus(orderId, status);
      await fetchMyDeliveries();
      if (status === 'Delivered') {
        setTrackingOrderId(null);
        fetchEarnings();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Could not update status');
    } finally {
      setLoading(false);
    }
  };

  const activeDeliveries = myDeliveries.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const pastDeliveries = myDeliveries.filter(o => o.status === 'Delivered' || o.status === 'Cancelled');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Truck size={28} />
            <div>
              <h1 className="text-xl font-bold">{profile.name}</h1>
              <p className="text-xs text-orange-100">{profile.vehicleType} · {profile.area}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleOnline}
              disabled={toggling}
              className={`px-4 py-2 rounded-full font-bold text-sm transition ${isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 hover:bg-gray-500'}`}
            >
              {toggling ? '...' : isOnline ? '🟢 Online' : '⚪ Offline'}
            </button>
            <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition flex items-center gap-2 text-sm">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {earnings && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full"><DollarSign size={20} className="text-green-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Total Earnings</p>
                <p className="text-xl font-bold text-gray-800">₹{earnings.totalEarnings}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Deliveries</p>
              <p className="text-xl font-bold text-gray-800">{earnings.totalDeliveries}</p>
            </div>
          </div>
        )}

        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            ⚪ You're offline. Go online to see and accept nearby orders.
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setTab('available')}
            className={`px-5 py-2 rounded-full font-semibold transition ${tab === 'available' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            Available Orders {availableOrders.length > 0 && `(${availableOrders.length})`}
          </button>
          <button
            onClick={() => setTab('mydeliveries')}
            className={`px-5 py-2 rounded-full font-semibold transition ${tab === 'mydeliveries' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border'}`}
          >
            My Deliveries {activeDeliveries.length > 0 && `(${activeDeliveries.length})`}
          </button>
        </div>

        {tab === 'available' && (
          <div>
            <div className="flex justify-end mb-3">
              <button onClick={fetchAvailableOrders} className="text-sm text-gray-600 flex items-center gap-1 hover:text-gray-800">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
            {!isOnline ? null : availableOrders.length === 0 ? (
              <div className="bg-white rounded-xl p-10 text-center text-gray-500">
                <Package size={48} className="mx-auto mb-3 text-gray-300" />
                No orders available right now. Stay online — new orders will show up here.
              </div>
            ) : (
              <div className="space-y-4">
                {availableOrders.map(order => (
                  <div key={order._id} className="bg-white rounded-xl shadow-md p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold">Order #{order._id.slice(-6)}</p>
                        {order.vendor && <p className="text-sm text-green-600">🏪 {order.vendor.dairyName}</p>}
                      </div>
                      {order.distanceFromMe !== null && (
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                          📍 {order.distanceFromMe} km away
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1"><MapPin size={14} className="inline mr-1" />{order.userAddress}</p>
                    <p className="text-sm text-gray-600 mb-3">{order.items.length} item{order.items.length > 1 ? 's' : ''} · ₹{order.total} · {order.paymentMethod}</p>
                    <button
                      onClick={() => handleAccept(order._id)}
                      disabled={loading}
                      className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-400"
                    >
                      Accept Order
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'mydeliveries' && (
          <div className="space-y-4">
            {activeDeliveries.length === 0 && pastDeliveries.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center text-gray-500">
                <Package size={48} className="mx-auto mb-3 text-gray-300" />
                No deliveries yet. Accept an order to get started.
              </div>
            )}

            {activeDeliveries.map(order => (
              <div key={order._id} className="bg-white rounded-xl shadow-md p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold">Order #{order._id.slice(-6)}</p>
                    {order.vendor && <p className="text-sm text-green-600">🏪 {order.vendor.dairyName}</p>}
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">{order.status}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1"><MapPin size={14} className="inline mr-1" />{order.userAddress}</p>
                <p className="text-sm text-gray-600 mb-1"><Phone size={14} className="inline mr-1" />{order.userPhone}</p>
                <p className="text-sm text-gray-600 mb-3">{order.items.length} item{order.items.length > 1 ? 's' : ''} · ₹{order.total} · {order.paymentMethod}</p>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setTrackingOrderId(trackingOrderId === order._id ? null : order._id)}
                    className="flex-1 bg-blue-50 text-blue-700 border-2 border-blue-200 py-2 rounded-lg font-semibold hover:bg-blue-100 transition flex items-center justify-center gap-2"
                  >
                    <Navigation size={16} /> {trackingOrderId === order._id ? 'Hide Map' : 'Track Route'}
                  </button>
                  {order.status !== 'In Transit' ? (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'In Transit')}
                      disabled={loading}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400"
                    >
                      Mark Picked Up
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                      disabled={loading}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>

                {trackingOrderId === order._id && trackingData && (
                  <LiveTrackingMap
                    pickup={trackingData.pickup}
                    drop={trackingData.drop}
                    deliveryBoyPosition={myPosition}
                  />
                )}
              </div>
            ))}

            {pastDeliveries.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-500 mt-6 mb-2">Completed</h3>
                {pastDeliveries.map(order => (
                  <div key={order._id} className="bg-white rounded-xl shadow-sm p-4 mb-2 flex justify-between items-center opacity-75">
                    <div>
                      <p className="font-semibold text-sm">Order #{order._id.slice(-6)}</p>
                      <p className="text-xs text-gray-500">{order.userAddress}</p>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;