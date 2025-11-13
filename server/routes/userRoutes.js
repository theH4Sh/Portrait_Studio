const express = require('express')
const { loginUser, signUpUser, getUser, verifyEmail, forgotPassword, resetPassword } = require('../controllers/userController')
const isVerified = require('../middleware/isVerified')
const router = express.Router()

router.post('/login', isVerified, loginUser)
router.post('/signup', signUpUser)
router.get('/:username', getUser)
router.get('/verify/:token', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', resetPassword)

module.exports = router