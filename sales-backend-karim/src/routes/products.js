const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all products
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Get product by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "Product not found" });

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Create product
router.post("/", async (req, res) => {
  try {
    const { name, price, stock } = req.body;

    const [result] = await db.query(
      "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
      [name, price, stock]
    );

    res.json({ id: result.insertId, message: "Product created" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// src/routes/products.js
router.put("/:id", async (req, res) => {
  const { name, price, stock } = req.body;

  if (!name || !price || !stock) {
    return res.status(400).json({ error: "Missing fields for update" });
  }

  try {
    await db.query(
      "UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?",
      [name, price, stock, req.params.id]
    );
    res.json({ message: "Product updated" });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
});


// delete product
router.delete("/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    // First, delete the product from order_lines
    await db.query("DELETE FROM order_lines WHERE product_id = ?", [productId]);

    // Then, delete the product from products table
    const result = await db.query("DELETE FROM products WHERE id = ?", [productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ error: "Failed to delete product", details: err.message });
  }
});


module.exports = router;
