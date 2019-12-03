// setImmediate(function() {
//   console.log('setImmediate延迟执行')
// })

// process.nextTick(function() {
//   console.log('nextTick延迟执行')
// })

// console.log('正常执行')

var fs = require('fs')

var bf = fs.readFileSync('./uploads/1.png')
var str = bf.toString()
var cp = new Buffer(str)

console.log(bf)
// <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 01
console.log(cp)
// <Buffer ef bf bd 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 01
// 上下Buffer值不同

fs.writeFileSync('./test.png', bf)
fs.writeFileSync('./test1.png', cp)
fs.writeFileSync('./test2.png', str)
