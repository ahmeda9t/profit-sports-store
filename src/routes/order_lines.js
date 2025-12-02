const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all order lines
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM order_lines");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order lines by order_id
router.get("/order/:order_id", async (req, res) => {
  const { order_id } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT * FROM order_lines WHERE order_id = ?",
      [order_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create order line
router.post("/", async (req, res) => {
  const { order_id, product_id, quantity, price } = req.body;

  if (!order_id || !product_id || !quantity || !price) {
    return res.status(400).json({ error: "Missing order line data" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO order_lines (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
      [order_id, product_id, quantity, price]
    );
    res.json({ id: result.insertId, order_id, product_id, quantity, price });
  } catch (err) {
    res.status(500).json({ error: "Failed to create order line" });
  }
});

// Update order line
router.put("/:id", async (req, res) => {
  const { quantity, price } = req.body;

  if (!quantity || !price) {
    return res.status(400).json({ error: "Missing quantity or price" });
  }

  try {
    await db.query(
      "UPDATE order_lines SET quantity = ?, price = ? WHERE id = ?",
      [quantity, price, req.params.id]
    );
    res.json({ message: "Order line updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete order line
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM order_lines WHERE id = ?", [req.params.id]);
    res.json({ message: "Order line deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
