const express = require('express')
const app = express()
const bodyParser = require('body-parser') // 将Htpp纯文本数据转换成更容易处理的对象的中间件解析器
const cookieParser = require('cookie-parser')
// const sessionParser = require('express-session')
const mysql = require('mysql')
const fortunes = require('./lib/fortunes')
const weather = require('./lib/weather')
const formidable = require('formidable') // 表单处理中间件
const fs = require('fs')
const hbs = require('express3-handlebars').create({
    defaultLayout: 'main',
    helpers: {
        section: function (name, options) {
            if (!this._sections) this._sections = {}
            this._sections[name] = options.fn(this)
            return null
        },
        foo: function () {
            return 'FOO!'
        }
    }
})

const cookieStr = 'cookie122222' + new Date().getTime()

// 1\. bodyParser.json(options): 解析json数据
// 2\. bodyParser.raw(options): 解析二进制格式(Buffer流数据)
// 3\. bodyParser.text(options): 解析文本数据
// 4\. bodyParser.urlencoded(options): 解析UTF-8的编码的数据。

// 创建数据库连接
const connection = mysql.createConnection({
    host: '47.99.40.220',
    user: 'root',
    password: 'Aa111111',
    database: 'demo'
})

// const pool = mysql.createPool({
//     connectionLimit: 10,
//     host: '47.99.40.220',
//     user: 'root',
//     password: 'Aa111111',
//     database: 'demo'
// })

app.use(express.static(__dirname + '/public'))

app.use(bodyParser())
app.use(cookieParser(cookieStr))
// app.use(sessionParser({
//     // key /
//     // store //会话存储的实例。默认为一个 MemoryStore 的实例
//     secret: 'keyboard cat', // 存放唯一会话标识的 cookie 名称。默认为 connect.sid 。
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: true } // 会话 cookie 的 cookie 设置 （ path 、 domain 、 secure 等）
//     // req.session.views
// }))

// 设置 handlebars 视图引擎
app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')
app.set('port', process.env.PORT || 3000)

// 是否开启mocha测试，必须放在所有路由之前
app.use((req, res, next) => {
    res.locals.showTests = req.query.test === '1'
    if (!res.locals.partials) res.locals.partials = {}
    res.locals.partials.weather = weather.getWeatherData()
    next()
})

// 项目根目录
app.get('/', function (req, res) {
    res.cookie('monster', 'nom nom') // 设置登录签名
    res.cookie('signed_monster', 'nom nom', {
        // domain  控制跟cookie关联的域名
        // path 控制应用这个 cookie 的路径
        signed: true, // 是否对cookie进行签名
        httpOnly: true, // 只允许服务器修改
        // maxAge:  // 指定cookie过期时间,单位毫秒
    })
    res.render('home')
})

// 用户登录
app.post('/user-login', function (req, res) {
    let { userName } = req.body
    try {
        // 开启数据库连接
        connection.connect()

        const queryStr = `select * from users where uname="${userName}"`

        // 查询数据库
        connection.query(queryStr, function (error, results, fields) {
            if (error) throw error
            // pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
            //     if (error) throw error
            //     console.log('The solution is: ', results[0].solution)
            // })

            if (results.length > 0) {  // 查询到相关数据则表示成功登陆
                // res.render('user-login', { isLogin: true })
                res.send('success')
            } else {
                res.render('user-login', { isLogin: false })
            }

            // res.end()
        })
    } catch (err) {
        throw err
    } finally {
        // 关闭数据库连接
        connection.end()
    }
})

// about
app.get('/about', function (req, res) {
    // var randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)]
    // res.render('about', { fortune: getFortunes() })
    res.render('about', {
        fortune: fortunes.getFortunes(),
        pageTestScript: 'qa/tests-about.js'
    })
})

// contact
app.get('/contact', function (req, res) {
    res.render('pages/contact')
})

app.get('/upload', (req, res) => {
    var date = new Date()
    res.render('upload', {
        month: date.getMonth() + 1,
        year: date.getFullYear()
    })
})

app.post('/upload/:year/:month', function (req, res) {
    const form = new formidable.IncomingForm()
    form.parse(req, function (err, fields, files) {

        // console.log('received fields:', fields)
        // console.log('received files:', files)

        if (err) return res.redirect(303, '/error')

        const fileOriginalFilename = files.photo.name
        const filePath = files.photo.path
        const dstPath = `./uploads/${new Date().getTime()}${fileOriginalFilename}`
        const readStream = fs.createReadStream(filePath) // 打开一个可读的文件流并且返回一个fs.ReadStream对象
        const writeStream = fs.createWriteStream(dstPath) // 将文件流写入目标磁盘

        readStream.pipe(writeStream) // 开启写入任务
        readStream.on('end', () => { // 写入结束后解除锁定
            fs.unlinkSync(filePath)
        })

        // fs.rename(filePath, dstPath, (err) => {
        //     if (err) {
        //         console.log('rename error: ' + err)
        //     } else {
        //         console.log('rename ok')
        //     }
        // })

        res.send('upload success')
        res.end()
    })
})

// /hood-river
app.get('/hood-river', (req, res) => {
    res.render('tours/hood-river')
})

// request-group-rate
app.get('/request-group-rate', function (req, res) {
    res.render('tours/request-group-rate')
})

// 404 catch-all 处理器（中间件）
app.use(function (req, res) {
    res.status(404)
    res.render('404')
})

// 
app.post('/process', function (req, res) {
    // req.xhr 是否是ajax请求
    // 应该根据 Accepts 头信息（可以根据 req.accepts 辅助方法轻松访问）返回一个适当的响应

    if (req.xhr || req.accepts('json,html') === 'json') {
        // 如果发生错误，应该发送 { error: 'error description' }
        res.send({ success: true })
    } else {
        // 如果发生错误，应该重定向到错误页面
        res.redirect(303, '/thank-you')
    }
})

// 500 错误处理器（中间件）
// 这应该出现在所有路由方法的结尾 
// 需要注意的是，即使你不需要一个 " 下一步 " 方法 
// 它也必须包含，以便 Express 将它识别为一个错误处理程序
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500)
    res.render('500')
})

// 启动应用程序
const server = app.listen(3000, () => {
    const host = server.address().address
    const port = server.address().port
    console.log('App listening at http://%s%s', host, port)
})