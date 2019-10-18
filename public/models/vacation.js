const mongoose = require('mongoose')

const vacationSchema = mongoose.Schema({
    name: String,
    slug: String,
    category: String,
    sku: String,
    description: String,
    priceInCents: Number,
    tags: [String],
    inSeason: Boolean,
    available: Boolean,
    requiresWaiver: Boolean,
    maximumGuests: Number,
    notes: String,
    packagesSold: Number,
})

vacationSchema.methods.getDisplayPrice = function () {
    return '$' + (this.priceInCents / 100).toFixed(2);
}

// vacationSchema.methods.addVacation = function (vacation) {
//     Vacation.find(function (err, vacations) {
//         if (vacations.length) return
//         new Vacation(vacation).save()

//         // new Vacation({
//         //     name: '测试数据3',
//         //     slug: 'rock-climbing-in-bend',
//         //     category: 'Adventure',
//         //     sku: 'B99',
//         //     description: 'Experience the thrill of climbing in the high desert.',
//         //     priceInCents: 289995,
//         //     tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
//         //     inSeason: true,
//         //     requiresWaiver: true,
//         //     maximumGuests: 4,
//         //     available: false,
//         //     packagesSold: 0,
//         //     notes: 'The tour guide is currently recovering from a skiing accident.',
//         // }).save();
//     })
// }

module.exports = mongoose.model('Vacation', vacationSchema)