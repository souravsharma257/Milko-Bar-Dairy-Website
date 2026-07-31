import React, { useState } from 'react';
import { Store, User, Mail, Phone, MapPin, Lock, CheckCircle, Crosshair } from 'lucide-react';
import { vendorAPI } from './services/api';

const VendorRegister = ({ onBackToHome, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    dairyName: '',
    ownerName: '',
    email: '',
    phone: '',
    whatsapp: '',
    password: '',
    address: '',
    area: '',
    city: 'Neemrana',
    pincode: '',
    latitude: '',
    longitude: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [locationStatus, setLocationStatus] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('❌ GPS not supported by your browser');
      return;
    }

    setLocationStatus('📍 Detecting location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocationStatus('✅ Location captured successfully!');
      },
      (error) => {
        setLocationStatus('❌ Could not get location. Please allow location access.');
        console.error(error);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await vendorAPI.register(formData);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Registration Successful! 🎉</h2>
          <p className="text-gray-600 mb-6">
            Your dairy registration has been submitted. Our admin team will review and approve your account within 24 hours.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-700">
              <strong>What's Next?</strong><br />
              1. Admin will review your details<br />
              2. You'll get approved status<br />
              3. Login and start adding products!
            </p>
          </div>
          <button
            onClick={onBackToHome}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Become a Vendor</h1>
          <p className="text-gray-600 mt-2">Sell your fresh dairy products on Milko Bar Dairy</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Dairy Info */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Store size={18} className="text-blue-600" /> Dairy Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="dairyName"
                  placeholder="Dairy Name (e.g., Ram Dairy Farm)"
                  value={formData.dairyName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="text"
                  name="ownerName"
                  placeholder="Owner Name"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Phone size={18} className="text-blue-600" /> Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="tel"
                  name="whatsapp"
                  placeholder="WhatsApp Number (optional)"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Create Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Location Info */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-blue-600" /> Location Details
              </h3>

              {/* GPS Location Button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={getLocation}
                  className="w-full bg-blue-50 text-blue-600 border-2 border-blue-200 py-3 rounded-lg font-semibold hover:bg-blue-100 transition flex items-center justify-center gap-2"
                >
                  <Crosshair size={18} /> Get My Current Location (GPS)
                </button>
                {locationStatus && (
                  <p className={`text-sm mt-2 ${locationStatus.includes('✅') ? 'text-green-600' : locationStatus.includes('❌') ? 'text-red-600' : 'text-blue-600'}`}>
                    {locationStatus}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  This helps customers find you easily. Please allow location access when prompted.
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  name="address"
                  placeholder="Full Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="grid md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="area"
                    placeholder="Area/Locality"
                    value={formData.area}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    name="pincode"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 mt-6"
            >
              {loading ? 'Submitting...' : 'Register as Vendor'}
            </button>

            <div className="flex justify-between text-sm mt-4">
              <button
                type="button"
                onClick={onBackToHome}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back to Home
              </button>
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Already a vendor? Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;