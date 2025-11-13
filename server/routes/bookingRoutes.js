const express = require('express')
const { createBooking, getAllBookings, getUserBooking, cancelBooking, updateBooking } = require('../controllers/bookingController')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

router.get('/getBookings', getAllBookings)
router.get('/userBookings', requireAuth, getUserBooking)
router.post('/create', requireAuth, createBooking)
router.patch('/cancel/:id', requireAuth, cancelBooking)
router.patch('/update/:id', requireAuth, updateBooking)

module.exports = router