const Product = require('../models/productModel');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching products' });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const id = await Product.createProduct(req.body);
    const created = await Product.getProductById(id);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: 'Error creating product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    await Product.updateProduct(req.params.id, req.body);
    const updated = await Product.getProductById(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.deleteProduct(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Error deleting product' });
  }
};

exports.decreaseStock = async (req, res) => {
  try {
    const { quantity } = req.body;
    await Product.decreaseStock(req.params.id, quantity);
    const updated = await Product.getProductById(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating stock' });
  }
};
