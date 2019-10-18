const Vacation = require('../models/vacation')

module.exports = {
    registerRoutes(app) {
        app.get('/vacation', this.getVacations)
        app.get('/vacations/addVacation/:id', this.addVacations)
    },
    addVacations(req, res, next) {
        const vacation = new Vacation({
            name: `测试数据${req.query.id}`,
            slug: 'rock-climbing-in-bend',
            category: 'Adventure',
            sku: 'B99',
            description: 'Experience the thrill of climbing in the high desert.',
            priceInCents: 289995,
            tags: ['weekend getaway', 'bend', 'high desert', 'rock climbing'],
            inSeason: true,
            requiresWaiver: true,
            maximumGuests: 4,
            available: false,
            packagesSold: 0,
            notes: 'The tour guide is currently recovering from a skiing accident.',
        });

        vacation.save((err, vacation) => {
            if (err) return res.send(500, 'Error occurred: database error.')
            res.json({
                retCode: '000000',
                retDesc: '添加数据成功',
                jsonBody: null
            })
        })
        console.log(req.params.id)
    },
    getVacations(req, res, next) {
        Vacation.find({ available: true }, function (err, vacations) {
            var context = {
                vacations: vacations.map(function (vacation) {
                    return {
                        sku: vacation.sku,
                        name: vacation.name,
                        description: vacation.description,
                        price: vacation.getDisplayPrice(),
                        inSeason: vacation.inSeason,
                    }
                })
            };
            res.render('vacations', context);
        });
    }
}