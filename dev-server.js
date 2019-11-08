const express = require('express')
const app = express()

app.get((req, res, next) => {
  // res.set({ 'Content-type': 'text/plain' })
  // res.set({ 'Content-type': 'text/html' })

  next()
})

app.get('/', (req, res, next) => {
  res.status('200').send('首页')
})

app.get('/about', (req, res, next) => {
    res.set({ '':''})
  res.end(`
      <h1>关于我们</h1>
      `)
})

app.listen(8888, () => {
  console.log('server is run at 8888')
})
