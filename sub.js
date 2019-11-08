const fs = require('fs')

console.log('this is sub fs')

fs.watch('./files/test.json', (eventType, filename) => {
  console.log(`事件类型是: ${eventType}`)
  if (filename) {
    console.log(`提供的文件名: ${filename}`)
  } else {
    console.log('文件名未提供')
  }
})

process.on('message', (m, socket) => {
  if (m === 'socket') {
    if (socket) {
      // 检查客户端 socket 是否存在。
      // socket 在被发送与被子进程接收这段时间内可被关闭。
      socket.end(`请求使用 ${process.argv[2]} 优先级处理`)
    }
  }
})

process.send({ foo: 'bar' })
