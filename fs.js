const fs = require('fs')
const data = new Uint8Array(Buffer.from('Node.js中文网'))
// const asyncHooks = require('async_hooks')

// const hook = asyncHooks.createHook({
//   init(asyncId, type, triggerAsyncId, resource) {
//     fs.writeSync(
//       1,
//       `init: asyncId-${asyncId},type-${type},triggerAsyncId-${triggerAsyncId}\n`
//     )
//   },
//   before(asyncId) {
//     fs.writeSync(1, `before: asyncId-${asyncId}\n`)
//   },
//   after(asyncId) {
//     fs.writeSync(1, `after: asyncId-${asyncId}\n`)
//   },
//   destroy(asyncId) {
//     fs.writeSync(1, `destroy: asyncId-${asyncId}\n`)
//   }
// })

// asyncHooks.createHook({
//   init (asyncId, type) {
//     const executionAsyncId = asyncHooks.executionAsyncId()

//     callstackMap[asyncId] = {
//       id: executionAsyncId,
//       isTCP: type === TCPWRAP_NAME,
//       __tm: Date.now()
//     }
//   }
// }).enable()

// 写文件
fs.writeFile('./files/文件111.json', data, err => {
  if (err) throw err
  // console.log(data)
  // console.log('文件已被保存')
})

// 写文件
fs.writeFile('./files/文件123.json', '{"name":"1111"}', err => {
  if (err) throw err
  // console.log(data)
  // console.log('文件已被保存')
})

// 获取文件信息
fs.stat('./files/test.json', (err, stats) => {
  console.log(stats.isDirectory())
  console.log('stats ---', stats)
})

// 读取文件
fs.readFile('./files/test.json', (err, data) => {
  if (err) throw err
  fs.writeFile('./files/1.json', data, err => {
    if (err) throw err
    console.log(data)
    console.log('json文件已被保存')
  })
})

// 不建议在调用 fs.open()、 fs.readFile() 或 fs.writeFile() 之前使用 fs.access() 检查文件的可访问性。
// 这样做会引入竞态条件，因为其他进程可能会在两个调用之间更改文件的状态。
// 相反，应该直接打开、读取或写入文件，如果文件无法访问则处理引发的错误
const file = './package.json'

// 检查当前目录中是否存在该文件。
fs.access(file, fs.constants.F_OK, err => {
  console.log(`${file} ${err ? '不存在' : '存在'}`)
})

// 检查文件是否可读。
fs.access(file, fs.constants.R_OK, err => {
  console.log(`${file} ${err ? '不可读' : '可读'}`)
})

// 检查文件是否可写。
fs.access(file, fs.constants.W_OK, err => {
  console.log(`${file} ${err ? '不可写' : '可写'}`)
})

// 检查当前目录中是否存在该文件，以及该文件是否可写。
fs.access(file, fs.constants.F_OK | fs.constants.W_OK, err => {
  if (err) {
    console.error(`${file} ${err.code === 'ENOENT' ? '不存在' : '只可读'}`)
  } else {
    console.log(`${file} 存在，且它是可写的`)
  }
})

// 创建 /tmp/a/apple 目录，无论是否存在 /tmp 和 /tmp/a 目录。
fs.mkdir('/tmp/a/apple', { recursive: true }, err => {
  if (err) throw err
})

//
// fs.rename('./files/1.json', `./files/${new Date().getTime()}.json`, err => {
//   if (err) {
//     console.log(`rename is err with: ${err}`)
//   }
// })

process.on('message', function(msg, server) {
  if (msg === 'server') {
    server.on('connection', socket => {
      socket.end('由子进程处理')
    })
  }
})

fs.open('myfile', 'wx', (err, fd) => {
  if (err) {
    if (err.code === 'EEXIST') {
      console.error('myfile 已存在')
      return
    }
    throw err
  }
  writeMyData(fd)
})

fs.open('./files/文件122.json', err => {
  if (err) return
  // 假设 'path/file.txt' 是常规文件。
  fs.unlink('./files/文件122.json', err => {
    if (err) throw err
    console.log('文件已删除')
  })
})

fs.watch('./files/test.json', (eventType, filename) => {
  console.log(`事件类型是: ${eventType}`)
  if (filename) {
    console.log(`提供的文件名: ${filename}`)
  } else {
    console.log('文件名未提供')
  }
})

// fs.open('./uploads/15709430518541567429639_184133.png', 'r', (err, fd) => {
//   if (err) throw err

//   fs.fstat(fd, (err, stat) => {
//     if (err) throw err
//     // 使用文件属性。
//     console.log(`fd is ${fd}`)
//     // 始终关闭文件描述符！
//     fs.close(fd, err => {
//       if (err) throw err
//     })
//   })
// })
