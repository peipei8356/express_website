const cpus = require('os').cpus()
// console.log(cpus)

const cp = require('child_process')
const fork = cp.fork
const sub1 = cp.fork('./sub.js')
// 开启 server，并发送 socket 给子进程。
// 使用 `pauseOnConnect` 防止 socket 在被发送到子进程之前被读取。
const server = require('net').createServer({ pauseOnConnect: true })

const normal = fork('sub.js', ['normal'])
const special = fork('sub.js', ['special'])

server.on('connection', socket => {
  // 特殊优先级。
  if (socket.remoteAddress === '74.125.127.100') {
    special.send('socket', socket)
    return
  }
  // 普通优先级。
  normal.send('socket', socket)
})

server.listen()

// 句柄传递
sub1.on('message', msg => {
  console.log('parent got msg:', msg)
})
sub1.send({ hello: 'world' })

// 自动重启进程
let workers = {}
let createWorker = function() {
  let worker = fork('./worker.js')

  // 如果子进程自动退出进程
  worker.on('message', function() {
    if (MessageChannel.act === 'suicide') {
      createWorker()
    }
  })

  worker.on('exit', function() {
    console.log(`worker : ${worker.pid} is exit`)
    delete workers[worker.pid]
    createWorker()
  })
  worker.send('server', server)
  workers[worker.pid] = worker
  console.log(`create worker.pid: ${worker.pid}`)
}
cpus.map(() => {
  console.log(111)
  createWorker()
})

process.on('exit', function() {
  workers.forEach(worker => {
    workers[worker.pid].kill()
  })
})
