const EventEmitter = require('events')

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter()

myEmitter.on('event', () => {
  console.log('触发事件')
})

myEmitter.emit('event')

let m = 0
myEmitter.once('event', () => {
  console.log(++m)
})
myEmitter.emit('event')
// 打印: 1
myEmitter.emit('event')
// 不触发

myEmitter.on('error', err => {
  console.error('错误信息')
})
myEmitter.emit('error')
// 打印: 错误信息

// 订阅
myEmitter.on('event1', function(message) {
  console.log(message)
})
// 发布
myEmitter.emit('event1', 'I am message!')

// EventEmitter 会按照监听器注册的顺序同步地调用所有监听器。
// 所以必须确保事件的排序正确，且避免竞态条件。
// 可以使用 setImmediate() 或 process.nextTick() 切换到异步模式：

myEmitter.on('event', (a, b) => {
  setImmediate(() => {
    console.log('异步进行')
  })
})
myEmitter.emit('event', 'a', 'b')

myEmitter.emit('error', new Error('错误信息'))

const times = 0
const render = function() {
  console.log('this is render')
}

var after = function(times, callback) {
  var count = 0,
    results = {}
  return function(key, value) {
    results[key] = value
    count++
    if (count === times) {
      callback(results)
    }
  }
}

var done = after(times, render)
