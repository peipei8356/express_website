const http = require('http')
const fork = require('child_process').fork

const longComputation = () => {
  let sum = 0
  console.info('计算开始')
  console.time('计算耗时')

  for (let i = 0; i < 1e10; i++) {
    sum += i
  }

  console.info('计算结束')
  console.timeEnd('计算耗时')
  return sum
}

const server = http.createServer((req, res) => {
  //   if (req.url === '/compute') {
  //     console.info('计算开始', new Date())
  //     const sum = longComputation()
  //     console.info('计算结束', new Date())
  //     return res.end(`Sum is ${sum}`)
  //   } else {
  //     res.end('Ok')
  //   }
  if (req.url == '/compute') {
    const compute = fork('./sub.js')
    compute.send('开启一个新的子进程')

    // 当一个子进程使用 process.send() 发送消息时会触发 'message' 事件
    compute.on('message', sum => {
      res.end(`Sumis ${sum}`)
      compute.kill()
    })

    // // 子进程监听到一些错误消息退出
    compute.on('close', (code, signal) => {
      console.log(
        `收到close事件，子进程收到信号 ${signal} 而终止，退出码 ${code}`
      )
      compute.kill()
    })
  } else {
    res.end(`ok`)
  }
})
server.listen(3000, '127.0.0.1', () => {
  console.log(`server started at http://127.0.0.1:${3000}`)
})
