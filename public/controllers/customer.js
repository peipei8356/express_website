const Customer = require('../modules/customer.js')
const customerViewModel = require('../viewModels/customer.js')

exports = {
    registerRoutes(app) {
        app.get('/customer/:id', this.home)
        app.get('/customer/:id/preferences', this.preferences)
        app.get('/orders/:id', this.orders)
        app.post('/customer/:id/update', this.ajaxUpdate)
    },
    home(req, res, next) {
        const customer = Customer.findById(req.params.id)
        if (!customer) return next() // 没有找到对应的数据,就传给404处理器
        res.render('customer/home', customerViewModel(customer))
    },
    preferences(req, res, next) {
        const customer = Customer.findById(req.params.id)
        if (!customer) return next() // 没有找到对应的数据,就传给404处理器
        res.render('customer/preferences', customerViewModel(customer))
    },
    orders: function (req, res, next) {
        const customer = Customer.findById(req.params.id)
        if (!customer) return next() //  将这个传给 404 处理器                 
        res.render('customer/orders', customerViewModel(customer))
    },
    ajaxUpdate: function (req, res) {
        const customer = Customer.findById(req.params.id)
        if (!customer) return res.json({ error: 'Invalid ID.' })
        if (req.body.firstName) {
            if (typeof req.body.firstName !== 'string' || req.body.firstName.trim() === '')
                return res.json({ error: 'Invalid name.' })
            customer.firstName = req.body.firstName
        }                 // 等等……                
        customer.save()
        return res.json({ success: true })
    }
}
