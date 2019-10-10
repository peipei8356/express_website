const express = require('express')
const app = express()
const handlebars = require('express3-handlebars').create({ defaultLayout: 'main' })
const fortunes = require('./lib/fortunes')

app.use(express.static(__dirname + '/public'))

// 设置 handlebars 视图引擎
app.engine('handlebars', handlebars.engine)
app.set('view engine', 'handlebars')
app.set('port', process.env.PORT || 3000)

// 是否开启mocha测试，必须放在所有路由之前
app.use((req, res, next) => {
    res.locals.showTests = req.query.test === '1'
    next()
})

// 项目根目录
app.get('/', function (req, res) {
    res.render('home');
});

// about
app.get('/about', function (req, res) {
    // var randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)]
    // res.render('about', { fortune: getFortunes() })
    res.render('about', {
        fortune: fortunes.getFortunes(),
        pageTestScript: 'qa/tests-about.js'
    })
});

app.get('/contact', function (req, res) {
    res.render('pages/contact');
});

app.get('/tours/hood-river', (req, res) => {
    res.render('tours/hood-river')
})

app.get('/tours/request-group-rate', function (req, res) {
    res.render('request-group-rate');
});

// 404 catch-all 处理器（中间件）
app.use(function (req, res, next) {
    res.status(404);
    res.render('404');
});

// 500 错误处理器（中间件）
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(3000, () => {
    console.log('server is run at 3000...')
    console.log('test')
})