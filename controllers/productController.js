const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    let imageUrl = '', imagePublicId = '';

    if (req.file) {
      imageUrl = req.file.path;
      imagePublicId = req.file.filename;
    }

    const product = new Product({ name, price, description, imageUrl, imagePublicId });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ error: 'Product not found' });

    // If new image uploaded, delete old one
    if (req.file) {
      if (product.imagePublicId) {
        await cloudinary.uploader.destroy(product.imagePublicId);
      }
      product.imageUrl = req.file.path;
      product.imagePublicId = req.file.filename;
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Optional: Only upload image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ url: req.file.path, publicId: req.file.filename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
