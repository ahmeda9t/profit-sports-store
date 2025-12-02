const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Daily sales summary
router.get("/daily-sales", async (req, res) => {
  try {
    const sql = `
      SELECT 
        DATE(o.created_at) AS date,
        SUM(ol.quantity * ol.unit_price) AS total_sales,
        COUNT(DISTINCT o.id) AS total_orders
      FROM orders o
      JOIN order_lines ol ON o.id = ol.order_id
      GROUP BY DATE(o.created_at)
      ORDER BY DATE(o.created_at) DESC
    `;

    const [results] = await db.query(sql);  // Using async/await with promise-based query
    res.json(results);
  } catch (err) {
    console.error("Error fetching daily sales:", err);
    res.status(500).json({ error: "Failed to fetch daily sales" });
  }
});

// ==========================================
// Get Low Stock Products (Stock <= 5)
// ==========================================
router.get("/low-stock", async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.id, 
        p.name, 
        i.stock
      FROM products p
      JOIN inventory i ON p.id = i.product_id
      WHERE i.stock <= 5
      ORDER BY i.stock ASC;
    `;
    const [results] = await db.query(sql);  // Query using async/await with promise-based query
    res.json(results);
  } catch (err) {
    console.error("Error fetching low stock products:", err);
    res.status(500).json({ error: "Failed to fetch low stock products" });
  }
});

// ==========================================
// Get Top Products by Quantity Sold
// ==========================================
router.get("/top-products", async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.id, 
        p.name, 
        SUM(ol.quantity) AS total_sold
      FROM products p
      JOIN order_lines ol ON p.id = ol.product_id
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 10;
    `;
    const [results] = await db.query(sql);  // Query using async/await with promise-based query
    res.json(results);
  } catch (err) {
    console.error("Error fetching top products:", err);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
});

module.exports = router;
