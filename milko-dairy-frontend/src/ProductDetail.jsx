import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, ArrowLeft, Heart } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ProductReviews from './components/ProductReviews';
import RatingStars from './components/RatingStars';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${id}`);
      setProduct(response.data.data);
    } catch (error) {
      toast.error('Failed to load product');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.product === product._id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        unit: product.unit,
        quantity: quantity
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart! 🛒');
  };

  const handleQuantityChange = (type) => {
    if (type === 'increment') {
      setQuantity(prev => Math.min(prev + 1, product.stock));
    } else {
      setQuantity(prev => Math.max(prev - 1, 1));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back to Products
        </button>

        {/* Product Details */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-8 p-8">
            {/* Product Image */}
            <div className="flex items-center justify-center bg-gray-50 rounded-xl p-8">
              <img
                src={product.image || '/placeholder-product.png'}
                alt={product.name}
                className="max-w-full h-auto object-contain max-h-96"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Category Badge */}
                <span className="inline-block px-4 py-1 bg-purple-100 text-purple-600 rounded-full text-sm font-medium mb-4">
                  {product.category}
                </span>

                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  {product.name}
                </h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-4">
                  <RatingStars rating={product.averageRating || 0} size={20} />
                  <span className="text-gray-600 text-sm">
                    ({product.numReviews || 0} reviews)
                  </span>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-purple-600">
                    ₹{product.price}
                  </span>
                  <span className="text-gray-500 text-lg">
                    / {product.unit}
                  </span>
                </div>

                {/* Stock Status */}
                <div className="mb-6">
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      In Stock ({product.stock} available)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div>
                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-gray-700 font-medium">Quantity:</span>
                  <div className="flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-2">
                    <button
                      onClick={() => handleQuantityChange('decrement')}
                      disabled={quantity <= 1}
                      className="text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus size={20} />
                    </button>
                    <span className="text-xl font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange('increment')}
                      disabled={quantity >= product.stock}
                      className="text-gray-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                  
                  <button className="px-6 py-4 border-2 border-purple-600 text-purple-600 rounded-xl hover:bg-purple-50 transition">
                    <Heart size={20} />
                  </button>
                </div>

                {/* Total Price Preview */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      ₹{product.price * quantity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <ProductReviews productId={product._id} />
      </div>
    </div>
  );
};

export default ProductDetail;