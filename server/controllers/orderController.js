const Order = require('../models/Order');
const Product = require('../models/Product');
const { getReservedQuantity } = require('../utils/availability');
const mongoose = require('mongoose');

// Create order (rental request)
const createOrder = async (req, res, next) => {
  try {
    const user = req.user; // may be undefined for walk-in if you allow that route without auth
    const isAdmin = user?.role === 'admin';
    const { products, phoneNumber, walkInName } = req.body;

    // basic validation
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products array required' });
    }

    // phone required for user orders; admin walk-ins must provide phone too
    if (!phoneNumber && !isAdmin) {
      return res.status(400).json({ error: 'Phone number required' });
    }

    // build orderProducts and check availability/prices
    let totalPrice = 0;
    const orderProducts = [];

    for (const item of products) {
      if (!item.productId || !item.quantity || !item.startDate || !item.endDate) {
        return res.status(400).json({ error: 'Each item must have productId, quantity, startDate, endDate' });
      }

      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ error: `Product not found or inactive: ${item.productId}` });
      }

      const start = new Date(item.startDate);
      const end = new Date(item.endDate);
      if (isNaN(start) || isNaN(end) || start >= end) {
        return res.status(400).json({ error: 'Invalid dates for product ' + product.name });
      }

      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (days <= 0) return res.status(400).json({ error: 'Rental must be at least one day' });

      // compute currently reserved units for that product in that period
      const reserved = await getReservedQuantity(product._id, start, end, ['pending','confirmed']);
      const available = product.quantity - reserved;

      if (available < item.quantity) {
        return res.status(409).json({
          error: `Not enough availability for ${product.name}. requested ${item.quantity}, available ${available}`
        });
      }

      totalPrice += product.pricePerDay * days * item.quantity;

      orderProducts.push({
        product: product._id,
        quantity: item.quantity,
        startDate: start,
        endDate: end
      });
    }

    const order = new Order({
      phoneNumber: phoneNumber,
      products: orderProducts,
      totalPrice,
      status: 'pending'
    });

    if (isAdmin && walkInName) {
      order.walkInName = walkInName
    } else {
      order.user = req.user._id
    }

    await order.save();
    res.status(201).json({ message: 'Rental request submitted', order });
  } catch (err) {
    next(err);
  }
};

// Get orders for current user
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).populate('products.product').sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

// Get a single order (authorised if owner or admin)
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid id' });

    const order = await Order.findById(id).populate('products.product');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // allow access for admin or owner
    if (req.user.role !== 'admin' && (!order.user || order.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json({ order });
  } catch (err) {
    next(err);
  }
};

// Admin: get all orders (optionally filter by status)
const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;
    const orders = await Order.find(query)
      .populate('user')
      .populate('products.product')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
};

// Admin: approve order
const approveOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orderId)) return res.status(400).json({ error: 'Invalid order id' });

    const order = await Order.findById(orderId).populate('products.product');
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.adminApproved) return res.status(400).json({ error: 'Order already approved' });
    if (order.status === 'canceled' || order.status === 'rejected') return res.status(400).json({ error: 'Cannot approve canceled or rejected order' });

    // final availability re-check at approval time (prevents race)
    for (const item of order.products) {
      const reserved = await getReservedQuantity(item.product._id, item.startDate, item.endDate, ['pending','confirmed']);
      // reserved includes this order's own pending quantity; subtract current order's own quantity
      const reservedExcludingThis = reserved - item.quantity;
      const available = item.product.quantity - reservedExcludingThis;
      if (available < item.quantity) {
        return res.status(409).json({
          error: `Not enough availability for ${item.product.name} at approval time. available: ${available}`
        });
      }
    }

    order.status = 'confirmed';
    order.adminApproved = true;
    order.admin = req.user._id;
    await order.save();

    res.json({ message: 'Order approved', order });
  } catch (err) {
    next(err);
  }
};

// Admin: reject order
const rejectOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.status === 'confirmed') return res.status(400).json({ error: 'Cannot reject confirmed order' });

    order.status = 'rejected';
    order.admin = req.user._id;
    await order.save();
    res.json({ message: 'Order rejected', order });
  } catch (err) {
    next(err);
  }
};

// User: cancel order (owner can cancel pending; admin can cancel any)
const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (req.user.role !== 'admin') {
      if (!order.user || order.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to cancel this order' });
      }
      if (order.status === 'confirmed') {
        return res.status(400).json({ error: 'Cannot cancel a confirmed order. Contact admin.' });
      }
    }

    order.status = 'canceled';
    order.admin = req.user.role === 'admin' ? req.user._id : order.admin;
    await order.save();
    res.json({ message: 'Order canceled', order });
  } catch (err) {
    next(err);
  }
};

// Admin: mark returned when items are returned
const markReturned = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.status !== 'confirmed') return res.status(400).json({ error: 'Only confirmed orders can be marked returned' });

    order.status = 'returned';
    await order.save();
    res.json({ message: 'Order marked returned', order });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  approveOrder,
  rejectOrder,
  cancelOrder,
  markReturned
};
