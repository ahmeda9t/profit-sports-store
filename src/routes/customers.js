const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all customers
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM customers ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

// Get customer by ID
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM customers WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// Create customer
router.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const [result] = await db.query(
      "INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)",
      [name, email, phone]
    );
    res.json({ id: result.insertId, name, email, phone });
  } catch (err) {
    res.status(500).json({ error: "Failed to create customer" });
  }
});

// Update customer
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    await db.query(
      "UPDATE customers SET name=?, email=?, phone=? WHERE id=?",
      [name, email, phone, req.params.id]
    );
    res.json({ id: req.params.id, name, email, phone });
  } catch (err) {
    res.status(500).json({ error: "Failed to update customer" });
  }
});

// Delete customer
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM customers WHERE id = ?", [req.params.id]);
    res.json({ message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete customer" });
  }
});

module.exports = router;
