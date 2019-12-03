// var asyncHooks = require('async_hooks')
// var http = require('http')
// var fs = require('fs')
// var hooks = { init: init }
// var asyncHook = asyncHooks.createHook(hooks)

// function init(asyncId, type, triggerId) {
//   fs.writeSync(1, `${type} -${asyncId}\n`)
// }

// asyncHook.enable()
// http
//   .createServer(function(req, res) {
//     res.end('hello qts')
//   })
//   .listen(8079)

const asyncHooks = require('async_hooks')
const hooks = {
  init(asyncId, type, triggerAsyncId, resource) {},
  before() {},
  after() {},
  destroy() {},
  promiseResolve() {}
}
const asyncHook = asyncHooks.createHook(hooks)

asyncHook.executionAsyncId()
asyncHook.triggerAsyncId()

const server = net
  .createServer(conn => {
    // Returns the ID of the server, not of the new connection, because the
    // callback runs in the execution scope of the server's MakeCallback().
    async_hooks.executionAsyncId()
  })
  .listen(port, () => {
    // Returns the ID of a TickObject (i.e. process.nextTick()) because all
    // callbacks passed to .listen() are wrapped in a nextTick().
    async_hooks.executionAsyncId()
  })
