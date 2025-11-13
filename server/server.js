const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
require('dotenv').config()

const productRoutes = require('./routes/productRoutes')
const userRoutes = require('./routes/userRoutes')
const bookingRoutes = require('./routes/bookingRoutes')

//models
const Product = require("./models/Product")

const app = express()
const cors = require('cors')

//Middleware
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

//MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MONGODB Connected"))
    .catch((err) => console.log(err))

//API Routes
app.use('/api', productRoutes)
app.use('/api', userRoutes)
app.use('/api/booking', bookingRoutes)

//Error Handling
app.use((err, req, res, next) => {
    console.log(err.stack)
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    })
})

const port = 8000
app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})