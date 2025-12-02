const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all employees
// src/routes/employees.js
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM employees ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});


// Get employee by ID
router.get("/:id", async (req, res) => {
  const employeeId = req.params.id;
  console.log("Fetching employee with ID:", employeeId);  // Debugging line

  try {
    const [rows] = await db.query("SELECT * FROM employees WHERE id = ?", [employeeId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching employee:", err);
    res.status(500).json({ error: "Failed to fetch employee" });
  }
});




// Create employee
// src/routes/employees.js
router.post("/", async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Validate input
    if (!name || !email || !role) {
      return res.status(400).json({ error: "Missing fields for employee" });
    }

    // Insert the employee into the database
    const [result] = await db.query(
      "INSERT INTO employees (name, email, role) VALUES (?, ?, ?)",
      [name, email, role]
    );

    // Respond with the newly created employee's data
    res.json({
      id: result.insertId,
      name,
      email,
      role
    });
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(500).json({ error: "Failed to create employee", details: err.message });
  }
});


// Update employee
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ error: "Missing fields for update" });
  }

  try {
    const [result] = await db.query(
      "UPDATE employees SET name = ?, email = ?, role = ? WHERE id = ?",
      [name, email, role, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee updated" });
  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({ error: "Failed to update employee", details: err.message });
  }
});

// Delete employee
/// src/routes/employees.js
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query("DELETE FROM employees WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee deleted" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ error: "Failed to delete employee", details: err.message });
  }
});

module.exports = router;

