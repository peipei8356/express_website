const http = require('http')
const server = http.createServer(function(req, res) {
  res.writeHead('200', { 'Content-type': 'text/plain' })
  res.end(`handle by child,pid is:${process.pid}`)
})

let worker
process.on('message', function(msg, tcp) {
  if (msg === 'server') {
    worker = tcp
    worker.on('connection', function(socket) {
      server.emit('connection', socket)
    })
  }
})

// 当碰见异常错误时
process.on('uncaughtException', function() {
  process.send({ act: 'suicide' })
  //停止接受新的连接
  worker.close(() => {
    // 所有已有连接关闭后，退出进程
    process.exit(1)
  })

  // 5秒后，强制退出进程
  setTimeout(() => {
    process.exit(1)
  }, 500)
})
