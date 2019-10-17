const mongoose = require('mongoose')
const Orders = require('./order.js')

const customerSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    salesNotes: [
        {
            date: Date,
            salespersonId: Number,
            notes: String,
        }
    ],
})

customerSchema.methods.getOrders = () => {
    return Orders.find({ customerId: this_id })
}

module.exports = mongoose.model('Customer', customerSchema)


