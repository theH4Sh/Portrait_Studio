const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const transporter = require('../utils/mailer')

const createToken = (user) => {
    return jwt.sign({
        _id: user._id,
        username: user.username,
        role: user.role
    }, process.env.SECRET, { expiresIn: '3d'})
}

const loginUser = async (req, res, next) => {
    const { identifier, password } = req.body

    try {
        const user = await User.login(identifier, password)

        const role = user.role
        const username = user.username

        //token
        const token = createToken(user)

        res.status(200).json({ username, token, role })
    } catch (error) {
        next(error)
    }
}

const signUpUser = async (req, res, next) => {
    const {username, email, password} = req.body

    try {
        const user = await User.signup(username, email, password)

        //token
        const token = createToken(user)

        const verificationLink = `http://localhost:8000/api/auth/verify/${token}`


        const mail = await transporter.sendMail({
        from: `"MyApp" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Verify your email',
        html: `
            <h2>Welcome ${user.username}!</h2>
            <p>Click below to verify your account:</p>
            <a href="${verificationLink}">${verificationLink}</a>
        `,
        });
        console.log("mail: ", mail)

        res.status(201).json({ message: `${username} registered successfully. Please check your email and verify`, token })
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

const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.params
        const decoded = jwt.verify(token, process.env.SECRET)
        console.log(decoded)
        const user = await User.findById(decoded._id)
        console.log(user)
        if (!user) return res.status(400).json({ error: "Invalid Token" })

        if (user.isVerified) {
            console.log("verified")
            return res.status(200).json({ message: "Already Verified" })
        }

        user.isVerified = true
        await user.save()

        res.status(200).json({ message: "Email verified successfully"})
    } catch (error) {
        console.log("Verification failed")
        next(error)
    }
}

module.exports = { loginUser, signUpUser, getUser, verifyEmail }