const Booking = require('../models/Booking')

const createBooking = async (req, res, next) => {
    const { bookingType, walkInName, startDate, endDate } = req.body;
    const isAdmin = req.user?.role === 'admin';
    console.log("user: ", req.user)

    try {
        // 💣 Validate input presence
        if (!bookingType || !startDate || !endDate) {
            return res.status(400).json({ error: "Missing required fields: bookingType, startDate, or endDate" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        const now = new Date();

        // 📅 Validate date order
        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({ error: "Invalid date format" });
        }

        if (start >= end) {
            return res.status(400).json({ error: "End date must be after start date" });
        }

        // ⏱️ Optional: Prevent past bookings
        if (start < now) {
            return res.status(400).json({ error: "Start date cannot be in the past" });
        }

        // 🔍 Check for conflicts
        const conflictBooking = await Booking.findOne({
            status: 'confirmed',
            $and: [
                { startDate: { $lt: end } },
                { endDate: { $gt: start } }
            ]
        });

        if (conflictBooking) {
            return res.status(409).json({
                error: 'Event already booked between selected dates',
                conflictBooking
            });
        }

        // ✅ Create booking
        const booking = new Booking({
            bookingType: bookingType,
            startDate: start,
            endDate: end,
            status: 'confirmed'
        });

        if (isAdmin && walkInName) {
            booking.walkInName = walkInName
        } else {
            booking.user = req.user._id
        }

        await booking.save();
        res.status(201).json({ booking });

    } catch (error) {
        next(error);
    }
}

const getAllBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find()
        if (!bookings) {
            res.status(404).json("No bookings yet")
        }
        res.json(bookings)
    } catch (error) {
        next(error)
    }
}

const getUserBooking = async (req, res, next) => {
    try {
        const userId = req.user._id
        console.log("user: ", req.user)
        const booking = await Booking.find({ user: userId })
        if (booking.length === 0 ) {
            return res.status(404).json("No bookings found for this user")
        }
        res.status(201).json(booking)
    } catch (error) {
        next(error)
    }
}

// 🧨 CANCEL BOOKING
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params
    const user = req.user

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    // 🧠 Check if user is allowed to cancel
    if (user.role !== 'admin' && booking.user._id !== user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to cancel this booking" })
    }

    // 💣 Prevent double cancel
    if (booking.status === 'canceled') {
      return res.status(400).json({ error: "Booking already cancelled" })
    }

    booking.status = 'canceled'
    await booking.save()

    res.status(200).json({ message: "Booking canceled successfully", booking })
  } catch (error) {
    next(error)
  }
}

// 🧰 UPDATE BOOKING
const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params
    const { bookingType, startDate, endDate, status } = req.body
    const user = req.user

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" })
    }

    // 🧠 Only admin or booking owner can update
    if (user.role !== 'admin' && booking.user.toString() !== user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update this booking" })
    }

    // 🧩 Update only allowed fields
    if (bookingType) booking.bookingType = bookingType
    if (startDate) booking.startDate = new Date(startDate)
    if (endDate) booking.endDate = new Date(endDate)

    // ⚙️ Admins can also change booking status (confirm/pending/cancelled)
    if (user.role === 'admin' && status) booking.status = status

    await booking.save()

    res.status(200).json({ message: "Booking updated successfully", booking })
  } catch (error) {
    next(error)
  }
}

module.exports = { createBooking, getAllBookings, getUserBooking, cancelBooking, updateBooking }