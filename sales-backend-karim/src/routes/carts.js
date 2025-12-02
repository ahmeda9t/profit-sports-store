const express = require("express");
const router = express.Router();
const db = require("../config/db");

// src/routes/carts.js
router.post("/add", async (req, res) => {
  const { user_id, product_id, quantity, unit_price } = req.body;

  if (!user_id || !product_id || !quantity || !unit_price) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    await db.query(
      "INSERT INTO cart_items (user_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
      [user_id, product_id, quantity, unit_price]
    );
    res.json({ message: "Item added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update quantity in cart
router.put("/update/:id", async (req, res) => {
  const { quantity } = req.body;
  const { id } = req.params;

  if (!quantity) {
    return res.status(400).json({ error: "Missing quantity" });
  }

  try {
    await db.query("UPDATE cart_items SET quantity = ? WHERE id = ?", [
      quantity,
      id,
    ]);
    res.json({ message: "Cart item updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove item from cart
router.delete("/remove/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM cart_items WHERE id = ?", [id]);
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all cart items
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cart_items");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear cart (used at checkout)
router.delete("/clear", async (req, res) => {
  try {
    await db.query("DELETE FROM cart_items");
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
