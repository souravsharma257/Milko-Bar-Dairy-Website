const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;

    // Build filter
    const filter = { isActive: true };
    
    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Build sort
    let sortOption = {};
    if (sort === 'price_asc') {
      sortOption.price = 1;
    } else if (sort === 'price_desc') {
      sortOption.price = -1;
    } else if (sort === 'name_asc') {
      sortOption.name = 1;
    } else if (sort === 'name_desc') {
      sortOption.name = -1;
    } else {
      sortOption.createdAt = -1; // Default: newest first
    }

    const products = await Product.find(filter).sort(sortOption);

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, category, price, unit, image, stock } = req.body;

    const productData = {
      name,
      category,
      price,
      unit,
      image: image || '🥛',
      stock: stock || 0
    };

    // If image file uploaded
    if (req.file) {
      productData.imageUrl = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = req.body.name || product.name;
      product.category = req.body.category || product.category;
      product.price = req.body.price !== undefined ? req.body.price : product.price;
      product.unit = req.body.unit || product.unit;
      product.image = req.body.image || product.image;
      product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
      product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;

      // If new image uploaded
      if (req.file) {
        product.imageUrl = `/uploads/products/${req.file.filename}`;
      }

      const updatedProduct = await product.save();

      res.json({
        success: true,
        data: updatedProduct
      });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update product price (Quick update for admin)
// @route   PATCH /api/products/:id/price
// @access  Private/Admin
const updateProductPrice = async (req, res) => {
  try {
    const { price } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.price = price;
      const updatedProduct = await product.save();

      res.json({
        success: true,
        data: updatedProduct
      });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getProducts,     // ← Export bhi ye naam se
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductPrice
};