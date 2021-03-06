const express = require('express')
const app = express()
const server = require('http').createServer(app)
const bodyParser = require('body-parser') // 将Htpp纯文本数据转换成更容易处理的对象的中间件解析器
const cookieParser = require('cookie-parser')
// const sessionParser = require('express-session')
const mysql = require('mysql')
const weather = require('./lib/weather')
const formidable = require('formidable') // 表单处理中间件
const fs = require('fs')

const email = require('./lib/email')()
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
    },
    static(name) {
      return require('./lib/static.js').map(name)
    }
  }
})

switch (app.get('env')) {
  case 'development':
    app.use(require('morgan')('dev'))
    break
  case 'production':
    app.use(
      require('express-logger')({
        path: __dirname + '/log/requests.log'
      })
    )
    break
}

// 创建数据库连接
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'db'
})

app.use(express.static(__dirname + '/public'))

app.use(bodyParser())
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
  const cluster = require('cluster')
  if (cluster.isWorker)
    console.log('Worker %d received request', cluster.worker.id)
  next()
  // 如果不调用next()，管道就会被终止，也不会再有处理器或中间件做后续处理。
  // 如果你不调用next() ，则应该发送一个响应到客户端（res.send、res.json、res.render 等）；
  // 如果你不这样做，客户端会被挂起并最终导致超时。
  // 如果调用了next() ，一般不宜再发送响应到客户端。
  // 如果你发送了，管道中后续的中间件或路由处理器还会执行，但它们发送的任何响应都会被忽略
})

app.use(function (req, res, next) {
  // 为这个请求创建一个域
  var domain = require('domain').create()
  // 处理这个域中的错误
  domain.on('error', function (err) {
    console.error('DOMAIN ERROR CAUGHT\n', err.stack)
    try {
      // 在 5 秒内进行故障保护关机
      setTimeout(function () {
        console.error('Failsafe shutdown.')
        process.exit(1)
      }, 5000)
      // 从集群中断开
      var worker = require('cluster').worker
      if (worker) worker.disconnect()
      // 停止接收新请求
      server.close()
      try {
        // 尝试使用 Express 错误路由
        next(err)
      } catch (err) {
        // 如果 Express 错误路由失效，尝试返回普通文本响应
        console.error('Express error mechanism failed.\n', err.stack)
        res.statusCode = 500
        res.setHeader('content-type', 'text/plain')
        res.end('Server error.')
      }
    } catch (err) {
      console.error('Unable to send 500 response.\n', err.stack)
    }
  })
  // 向域中添加请求和响应对象
  domain.add(req)
  domain.add(res)
  // 执行该域中剩余的请求链
  domain.run(next)
})

// 项目根目录
app.get('/', function (req, res) {
  res.cookie('monster', 'nom nom') // 设置登录签名
  res.cookie('signed_monster', 'nom nom', {
    // domain  控制跟cookie关联的域名
    // path 控制应用这个 cookie 的路径
    signed: true, // 是否对cookie进行签名
    httpOnly: true // 只允许服务器修改
    // maxAge:  // 指定cookie过期时间,单位毫秒
  })

  res.render('home')
})

// 错误处理
app.get('/fail', function (req, res) {
  throw new Error('Nope!')
})

// **错误的示范**
app.get('/epic-fail', function (req, res) {
  process.nextTick(function () {
    throw new Error('Kaboom!')
  })
})

// 发送邮件
app.post('/send-email', (req, res, next) => {
  email.send('peipei8356@163.com', 'Node test', '你好,Eva,这里是测试文本内容')
})

// 重复使用路由
function authorize(req, res, next) {
  if (req.session.authorized) return next()
  res.render('not-authorized')
}

// 用户登录
app.get('/user-login', authorize, (req, res, next) => {
  res.render('user-login')
})


function handleDisconnect(connection) {
  //监听错误事件
  connection.on('error', function (err) {
    if (!err.fatal) {
      return;
    }

    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }

    console.log('Re-connecting lost connection: ' + err.stack);
    connection = mysql.createConnection(connection.config);
    handleDisconnect(connection);
    connection.connect();
  });
}

app.get('/queryGoodsList', function (req, res) {
  try {
    const queryStr = 'select * from t_goods_info'
    // 打开数据库连接
    pool.query(queryStr, function (error, results, fields) {
      let resJson = {
        retDesc: '失败',
        retCode: '99'
      }
      if (error) {
        res.json(resJson)
        throw error
      } else {
        resJson = {
          retDesc: '成功',
          retCode: '00',
          jsonBody: {
            list: results.length > 0 ? results : []
          }
        }
        res.json(resJson)
      }
    })


  } catch (e) {
    throw e
  } finally {
    // 关闭数据库连接
    // connection.end()
  }
})

app.post('/userLogin', function (req, res) {
  let { userName } = req.body
  try {
    // 开启数据库连接
    connection.connect()

    const queryStr = `select * from t_user where uname="${userName}"`

    // 查询数据库
    connection.query(queryStr, function (error, results, fields) {
      if (error) throw error

      // pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
      //     if (error) throw error
      //     console.log('The solution is: ', results[0].solution)
      // })

      if (results.length > 0) {
        // 查询到相关数据则表示成功登陆
        res.render('user-status', { isLogin: true })
      } else {
        res.render('user-status', { isLogin: false })
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
    const fileDir = `${__dirname}/uploads`
    // 文件夹是否存在，不存在则创建文件夹
    fs.existsSync(fileDir) || fs.mkdirSync(fileDir)
    const dstPath = `${fileDir}/${new Date().getTime()}${fileOriginalFilename}`
    const readStream = fs.createReadStream(filePath) // 打开一个可读的文件流并且返回一个fs.ReadStream对象
    const writeStream = fs.createWriteStream(dstPath) // 将文件流写入目标磁盘

    readStream.pipe(writeStream) // 开启写入任务
    readStream.on('end', () => {
      // 写入结束后解除锁定
      fs.unlinkSync(filePath)
    })

    res.send('upload success')
    res.end()
  })
})

app.get('/download', function (req, res) {

  const fileName = 'app-release.apk'
  const filePath = "./downloads/" + fileName
  const size = fs.statSync(filePath).size
  const file = fs.createReadStream(filePath)

  res.writeHead(200, {
    'Content-Type': 'application/force-download',
    'Content-Disposition': `attachment;filename=${fileName}`,
    'Content-Length': size
  })

  file.pipe(res)
})
// /hood-river
app.get('/hood-river', (req, res) => {
  res.render('tours/hood-river')
})

// request-group-rate
app.get('/request-group-rate', function (req, res) {
  res.render('tours/request-group-rate')
})

// 添加自动化渲染
const autoview = {}
app.use((req, res, next) => {
  const path = req.path.toLowerCase()
  // 检查缓存；如果它在那里，渲染这个视图
  if (autoview[path]) {
    return res.render(autoview[path])
  }

  // 如果它不在缓存里，那就看看有没有 .handlebars 文件能匹配
  if (fs.existsSync(`${__dirname}/views/${path}.handlebars`)) {
    autoViews[path] = path.replace(/^\//, '')
    return res.render(`${__dirname}/views/${path}.handlebars`)
  }

  // 没发现视图；转到 404 处理器
  next()
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


function startServer() {
  server.listen(app.get('port'), function () {
    console.log(
      'Express started in ' +
      app.get('env') +
      ' mode on http://localhost:' +
      app.get('port') +
      '; press Ctrl-C to terminate.'
    )
  })
}

startServer()
