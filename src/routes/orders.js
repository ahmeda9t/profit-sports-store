const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET all orders
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT o.*, c.name AS customer_name, e.name AS employee_name
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       LEFT JOIN employees e ON o.employee_id = e.id
       ORDER BY o.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET order details with order lines
router.get("/:id", async (req, res) => {
  try {
    const [orderRows] = await db.query(
      `SELECT * FROM orders WHERE id = ?`,
      [req.params.id]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const [lineRows] = await db.query(
      `SELECT ol.*, p.name AS product_name
       FROM order_lines ol
       LEFT JOIN products p ON ol.product_id = p.id
       WHERE ol.order_id = ?`,
      [req.params.id]
    );

    res.json({
      order: orderRows[0],
      lines: lineRows
    });
  } catch (err) {
    console.error("Error fetching order details:", err);
    res.status(500).json({ error: "Failed to fetch order details" });
  }
});

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
      "INSERT INTO order_lines (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
      [order_id, item.product_id, item.quantity, item.price]  // Here, item.price is mapped to unit_price
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


// UPDATE order (example: changing discount or status)
router.put("/:id", async (req, res) => {
  const { discount } = req.body;

  if (!discount) {
    return res.status(400).json({ error: "Missing discount" });
  }

  try {
    await db.query(
      `UPDATE orders
       SET discount = ?
       WHERE id = ?`,
      [discount, req.params.id]
    );

    res.json({ message: "Order updated" });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// DELETE order
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM orders WHERE id = ?", [req.params.id]);
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error("Error deleting order:", err);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

module.exports = router;
