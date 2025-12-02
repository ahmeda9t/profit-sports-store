const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all inventory items
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT i.*, p.name FROM inventory i JOIN products p ON i.product_id = p.id"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add stock to inventory (create a new entry)
router.post("/", async (req, res) => {
  const { product_id, stock } = req.body;

  // Validate input data
  if (!product_id || stock == null) {
    return res.status(400).json({ error: "Missing product_id or stock quantity" });
  }

  try {
    // Check if the product exists in the products table
    const [product] = await db.query("SELECT * FROM products WHERE id = ?", [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if there's already an inventory record for this product
    const [existingInventory] = await db.query("SELECT * FROM inventory WHERE product_id = ?", [product_id]);

    if (existingInventory.length > 0) {
      // If inventory record exists, update the stock
      const newStock = existingInventory[0].stock + stock;
      await db.query("UPDATE inventory SET stock = ? WHERE product_id = ?", [newStock, product_id]);
      res.json({ message: "Inventory stock updated", product_id, stock: newStock });
    } else {
      // If inventory record doesn't exist, insert a new record
      await db.query("INSERT INTO inventory (product_id, stock) VALUES (?, ?)", [product_id, stock]);
      res.json({ message: "Inventory stock created", product_id, stock });
    }
  } catch (err) {
    console.error("Error adding inventory stock:", err);
    res.status(500).json({ error: "Failed to add inventory stock", details: err.message });
  }
});

module.exports = router;


// Update stock for a product
router.put("/:product_id", async (req, res) => {
  const { product_id } = req.params;
  const { stock } = req.body;

  try {
    await db.query("UPDATE inventory SET stock=? WHERE product_id=?", [
      stock,
      product_id,
    ]);
    res.json({ message: "Stock updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an inventory item
router.delete("/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    // First, delete the related order lines (if any)
    await db.query("DELETE FROM order_lines WHERE product_id = ?", [productId]);

    // Now, delete the inventory item
    const result = await db.query("DELETE FROM inventory WHERE product_id = ?", [productId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Inventory item not found" });
    }

    res.json({ message: "Inventory item deleted" });
  } catch (err) {
    console.error("Error deleting inventory item:", err);
    res.status(500).json({ error: "Failed to delete inventory item", details: err.message });
  }
});

// Low-stock items (e.g., stock < 5)
router.get("/low-stock", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT i.*, p.name FROM inventory i JOIN products p ON i.product_id = p.id WHERE i.stock < 5"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
