const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");
const Order = require("./models/Order");
const { authenticateToken } = require("./middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Garment pricing
const garmentPrices = {
  Shirt: 150,
  Pants: 200,
  Saree: 500,
  Dress: 350,
  Suit: 800,
  Jacket: 400,
  "T-Shirt": 100,
  Undergarments: 50,
};

// ============= AUTHENTICATION ENDPOINTS =============

// Register new staff member
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password required" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Create new user
    const user = new User({ username, password, email });
    await user.save();

    res.status(201).json({
      success: true,
      message: "Staff account created successfully",
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login staff member
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password required" });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Generate JWT token (expires in 24 hours)
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= ORDER ENDPOINTS (Protected) =============

// 1. CREATE ORDER
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { customerName, phoneNumber, garments, notes } = req.body;
    const userId = req.user.id;

    // Validation
    if (!customerName || !phoneNumber || !garments || garments.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Calculate total bill
    let totalBill = 0;
    const garmentDetails = garments.map((g) => {
      const price = garmentPrices[g.name] || g.price || 0;
      const itemTotal = price * g.quantity;
      totalBill += itemTotal;
      return {
        name: g.name,
        quantity: g.quantity,
        price: price,
        subtotal: itemTotal,
      };
    });

    // Create order
    const orderId = uuidv4().split("-")[0].toUpperCase();
    const order = new Order({
      id: orderId,
      createdBy: userId,
      customerName,
      phoneNumber,
      garments: garmentDetails,
      totalBill,
      status: "RECEIVED",
      estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notes: notes || [],
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. UPDATE ORDER STATUS
app.patch("/api/orders/:orderId/status", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ["RECEIVED", "PROCESSING", "READY", "DELIVERED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Find order by ID and ensure it belongs to the user
    const order = await Order.findOne({ id: orderId, createdBy: userId });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET ALL ORDERS (with filtering)
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    const { status, customerName, phoneNumber } = req.query;
    const userId = req.user.id;

    // Build filter query
    let query = { createdBy: userId };

    if (status) {
      query.status = status.toUpperCase();
    }
    if (customerName) {
      query.customerName = { $regex: customerName, $options: "i" };
    }
    if (phoneNumber) {
      query.phoneNumber = { $regex: phoneNumber };
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. GET SINGLE ORDER
app.get("/api/orders/:orderId", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ id: orderId, createdBy: userId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. DASHBOARD
app.get("/api/dashboard", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all orders for the logged-in user
    const allOrders = await Order.find({ createdBy: userId });

    const stats = {
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, o) => sum + o.totalBill, 0),
      ordersByStatus: {
        RECEIVED: allOrders.filter((o) => o.status === "RECEIVED").length,
        PROCESSING: allOrders.filter((o) => o.status === "PROCESSING").length,
        READY: allOrders.filter((o) => o.status === "READY").length,
        DELIVERED: allOrders.filter((o) => o.status === "DELIVERED").length,
      },
      averageOrderValue:
        allOrders.length > 0
          ? (
              allOrders.reduce((sum, o) => sum + o.totalBill, 0) /
              allOrders.length
            ).toFixed(2)
          : 0,
      recentOrders: allOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    };

    res.json({
      success: true,
      ...stats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. DELETE ORDER
app.post("/api/delete/:orderId", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Find and delete order (only if it belongs to the user)
    const result = await Order.deleteOne({ id: orderId, createdBy: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= PUBLIC ENDPOINTS =============

// 7. GET GARMENT PRICING
app.get("/api/garments", (req, res) => {
  res.json({
    success: true,
    garments: garmentPrices,
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(
    `✅ Laundry Order Management API running on http://localhost:${PORT}`
  );
  console.log(`📊 Dashboard: http://localhost:${PORT}/index.html`);
  console.log(`🔐 Login: POST /api/auth/login`);
  console.log(`📝 Register: POST /api/auth/register`);
});
