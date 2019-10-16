const app = require('express')()
const router = require('./routers')(app)

app.listen(3000, function () {
    console.log(' 监听端口 3000');
});