const User = require('../models/userModel')
const jwt = require('jsonwebtoken')

const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d'})
}

const loginUser = async (req, res, next) => {
    const { identifier, password } = req.body

    try {
        const user = await User.login(identifier, password)

        const role = user.role
        const username = user.username

        //token
        const token = createToken(user._id)

        res.status(200).json({ username, password, token, role })
    } catch (error) {
        next(error)
    }
}

const signUpUser = async (req, res, next) => {
    const {username, email, password} = req.body

    try {
        const user = await User.signup(username, email, password)

        //token
        const token = createToken(user._id)

        res.status(201).json({ username, email, token, message: `${username} registered successfully` })
    } catch (error) {
        next(error)
    }
}

const getUser = async (req, res, next) => {
    const { username } = req.params

    try {
        const user = await User.findOne({ username }).select("-password")
        if (user.length == 0) {
            return res.status(404).json({error: 'user not found'})
        }
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

module.exports = { loginUser, signUpUser, getUser }