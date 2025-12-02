// src/index.js
require("dotenv").config();  // Load environment variables from .env file
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());  // Middleware to parse incoming JSON requests
app.use(cors());  // Middleware for enabling Cross-Origin Resource Sharing (CORS)

// ROUTES
app.use("/customers", require("./routes/customers"));
app.use("/employees", require("./routes/employees"));
app.use("/products", require("./routes/products"));
app.use("/orders", require("./routes/orders"));
app.use("/order-lines", require("./routes/order_lines"));
app.use("/payments", require("./routes/payments"));
app.use("/inventory", require("./routes/inventory"));
app.use("/cart", require("./routes/carts"));
app.use("/reports", require("./routes/reports"));  // Reports route

// SERVER
const PORT = process.env.PORT || 3000;  // Use port from .env, fallback to 3000 if not available
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));  // Start the server and listen on the specified port
