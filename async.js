// const async = require('async')
// const fs = require('fs')

// async.series(
//   [
//     callback => {
//       fs.readFile('./uploads/1.png', 'utf-8', callback)
//     },
//     callback => {
//       fs.readFile('./uploads/2.jpg', 'utf-8', callback)
//     }
//   ],
//   (err, res) => {
//     if (err) throw new Error(err)
//     console.log(res)
//   }
// )

const http = require('http')

// const http = require('http')
const longComputation = () => {
  let sum = 0
  for (let i = 0; i < 1e10; i++) {
    sum += i
  }
  return sum
}
const server = http.createServer()
server.on('request', (req, res) => {
  process.title = 'A-程序员成长指北测试进程'
  console.info(process.cwd)
  console.log(process.pid, process.title)
  if (req.url === '/compute') {
    console.info('计算开始', new Date())
    const sum = longComputation()
    console.info('计算结束', new Date())
    return
    res.end(`Sum is ${sum}`)
  } else {
    res.end('Ok')
  }
})

server.listen(3000)
//打印结果
//计算开始 2019-07-28T07:08:49.849Z
//计算结束 2019-07-28T07:09:04.522Z
