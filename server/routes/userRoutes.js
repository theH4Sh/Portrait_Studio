const express = require('express')
const { loginUser, signUpUser, getUser, verifyEmail } = require('../controllers/userController')

const router = express.Router()

router.post('/login', loginUser)
router.post('/signup', signUpUser)
router.get('/:username', getUser)
router.get('/verify/:token', verifyEmail)

module.exports = router