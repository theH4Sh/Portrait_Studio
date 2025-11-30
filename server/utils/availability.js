const Order = require('../models/Order');

/**
 * Returns total reserved units for a product that overlap [start,end).
 * statusFilter - list of order.status to consider reserved (e.g. ['pending','confirmed'])
 */
const getReservedQuantity = async (productId, start, end, statusFilter = ['pending','confirmed']) => {
  // find orders that have overlapping product entries
  const overlappingOrders = await Order.find({
    status: { $in: statusFilter },
    'products.product': productId,
    $or: [
      { 'products.startDate': { $lt: end }, 'products.endDate': { $gt: start } },
      // For safety, use $elemMatch below when aggregating but this simple find narrows set
    ]
  }).lean();

  let reserved = 0;
  for (const ord of overlappingOrders) {
    for (const p of ord.products) {
      if (p.product.toString() === productId.toString()) {
        // if dates overlap (strict check)
        const pStart = new Date(p.startDate);
        const pEnd = new Date(p.endDate);
        if (pStart < end && pEnd > start) {
          reserved += p.quantity;
        }
      }
    }
  }
  return reserved;
};

module.exports = { getReservedQuantity };
