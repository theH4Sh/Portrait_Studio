const express = require('express')
const { loginUser, signUpUser, getUser } = require('../controllers/userController')

const router = express.Router()

router.post('/login', loginUser)
router.post('/signup', signUpUser)
router.get('/:username', getUser)

module.exports = router