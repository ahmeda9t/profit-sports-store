// src/routes/orders.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Finalize sale (checkout)
router.post("/checkout", async (req, res) => {
  const { customer_id, employee_id, cart, discount_type, discount_value } = req.body;

  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  try {
    // Calculate subtotal
    let total_amount = 0;
    for (let item of cart) {
      total_amount += item.price * item.quantity;
    }

    // Calculate discount
    let discount = 0;
    if (discount_type === "percent") {
      discount = total_amount * (discount_value / 100);
    } else if (discount_type === "fixed") {
      discount = discount_value;
    }

    // Ensure valid discount values
    if (discount < 0) discount = 0;
    if (discount > total_amount) discount = total_amount;

    // Final amount
    const final_amount = total_amount - discount;

    // Insert order
    const [orderResult] = await db.query(
      "INSERT INTO orders (customer_id, employee_id, total_amount, discount, final_amount) VALUES (?, ?, ?, ?, ?)",
      [customer_id, employee_id, total_amount, discount, final_amount]
    );

    const order_id = orderResult.insertId;

    // Insert OrderLines
    for (let item of cart) {
      await db.query(
        "INSERT INTO order_lines (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
        [order_id, item.product_id, item.quantity, item.price]
      );
    }

    // Insert Payment
    await db.query(
      "INSERT INTO payments (order_id, amount, status) VALUES (?, ?, ?)",
      [order_id, final_amount, "paid"]
    );

    return res.json({
      message: "Checkout completed successfully",
      order_id,
      total_amount,
      discount,
      final_amount
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ message: "Checkout failed", error: error.message });
  }
});

// Get all payments
router.get("/", async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM payments");
    res.json(result);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Error fetching payments" });
  }
});

// Create payment for an order
router.post("/", async (req, res) => {
  const { order_id, amount, status } = req.body;

  if (!order_id || !amount || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO payments (order_id, amount, status) VALUES (?, ?, ?)",
      [order_id, amount, status]
    );
    res.status(201).json({
      message: "Payment created successfully",
      payment_id: result.insertId,
      order_id,
      amount,
      status,
    });
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

// Get single payment by ID
router.get("/:id", async (req, res) => {
  try {
    const [result] = await db.query("SELECT * FROM payments WHERE id = ?", [req.params.id]);
    if (result.length === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: "Error fetching payment" });
  }
});

// Update payment (status or amount)
router.put("/:id", async (req, res) => {
  const paymentId = req.params.id;
  const { amount, status } = req.body;

  if (!amount || !status) {
    return res.status(400).json({ error: "Missing fields for update" });
  }

  try {
    const [result] = await db.query(
      "UPDATE payments SET amount = ?, status = ? WHERE id = ?",
      [amount, status, paymentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ message: "Payment updated", paymentId, amount, status });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ error: "Failed to update payment", details: error.message });
  }
});

// Delete payment
router.delete("/:id", async (req, res) => {
  const paymentId = req.params.id;

  try {
    const [result] = await db.query("DELETE FROM payments WHERE id = ?", [paymentId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ message: "Payment deleted" });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ error: "Failed to delete payment", details: error.message });
  }
});

module.exports = router;
