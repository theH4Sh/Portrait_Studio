const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const isAdmin = require('../middleware/isAdmin');
const orderCtrl = require('../controllers/orderController');

// user routes
router.post('/', requireAuth, orderCtrl.createOrder);               // create order
router.get('/my', requireAuth, orderCtrl.getUserOrders);            // list user's orders
router.get('/:id', requireAuth, orderCtrl.getOrderById);            // get single order
router.post('/:orderId/cancel', requireAuth, orderCtrl.cancelOrder);

// admin routes
router.get('/', requireAuth, isAdmin, orderCtrl.getAllOrders);      // all orders (admin)
router.post('/:orderId/approve', requireAuth, isAdmin, orderCtrl.approveOrder);
router.post('/:orderId/reject', requireAuth, isAdmin, orderCtrl.rejectOrder);
router.post('/:orderId/returned', requireAuth, isAdmin, orderCtrl.markReturned);

module.exports = router;
