const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: false 

    },
    walkInName:{ 
        type: String, 
        required: function () {
        return !this.user
    }},
    bookingType: { 
        type: String, 
        enum: ['portrait', 'event', 'others'],
        default: 'event',
        required: true 
    },
    startDate: { 
        type: Date, 
        required: true 

    },
    endDate: { 
        type: Date, 
        required: true

    },
    status: { 
        type: String, 
        enum: ["pending", "confirmed", "canceled"], 
        default: "pending" 
    }
}, { timestamps: true })

module.exports = mongoose.model("Booking", bookingSchema)