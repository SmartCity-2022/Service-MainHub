const config = require('./config.js')
const app = require('./server.js')

app.listen(config.BACKEND_PORT)