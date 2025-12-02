const pool = require('../config/db');

async function getAllProducts() {
  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name, b.name AS brand_name, s.name AS supplier_name
     FROM Products p
     JOIN Categories c ON p.category_id = c.category_id
     JOIN Brands b ON p.brand_id = b.brand_id
     JOIN Suppliers s ON p.supplier_id = s.supplier_id`
  );
  return rows;
}

async function getProductById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM Products WHERE product_id = ?',
    [id]
  );
  return rows[0];
}

async function createProduct(data) {
  const {
    category_id,
    brand_id,
    supplier_id,
    name,
    unit_price,
    quantity_on_hand
  } = data;

  const [result] = await pool.query(
    `INSERT INTO Products
     (category_id, brand_id, supplier_id, name, unit_price, quantity_on_hand)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [category_id, brand_id, supplier_id, name, unit_price, quantity_on_hand]
  );

  return result.insertId;
}

async function updateProduct(id, data) {
  const {
    category_id,
    brand_id,
    supplier_id,
    name,
    unit_price,
    quantity_on_hand
  } = data;

  await pool.query(
    `UPDATE Products
     SET category_id = ?, brand_id = ?, supplier_id = ?, name = ?, unit_price = ?, quantity_on_hand = ?
     WHERE product_id = ?`,
    [category_id, brand_id, supplier_id, name, unit_price, quantity_on_hand, id]
  );
}

async function deleteProduct(id) {
  await pool.query('DELETE FROM Products WHERE product_id = ?', [id]);
}

async function decreaseStock(productId, quantity) {
  await pool.query(
    `UPDATE Products
     SET quantity_on_hand = quantity_on_hand - ?
     WHERE product_id = ? AND quantity_on_hand >= ?`,
    [quantity, productId, quantity]
  );
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  decreaseStock
};
