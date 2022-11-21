const express = require('express')
const cors = require('cors')
const serverless = require('serverless-http')
const Pusher = require('pusher')
const pusher = new Pusher({
  appId: '1496101',
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'us3',
  useTLS: true
})
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

const router = express.Router()
router.post('/pusher/user-auth', (req, res) => {
  const socketId = req.body.socket_id
  console.log('serverlessContext:', req.serverlessContext.clientContext)
  // Replace this with code to retrieve the actual user id and info
  const user = {
    id: req.serverlessContext.clientContext.user.email,
    name: req.serverlessContext.clientContext.user.user_metadata.full_name,
    user_info: req.serverlessContext.clientContext.user
  }
  const authResponse = pusher.authenticateUser(socketId, user)
  res.send(authResponse)
})
router.post('/pusher/auth', (req, res) => {
  if (!req.serverlessContext.clientContext.user) {
    res.status(400)
    return
  }
  const socketId = req.body.socket_id
  const channel = req.body.channel_name
  const authReponse = pusher.authorizeChannel(socketId, channel)
  res.send(authReponse)
})

app.use('/.netlify/functions/main', router) // path must route to lambda
app.use(express.static('public'))

module.exports = app
module.exports.handler = serverless(app, {
  request (req, event, context) {
    req.serverlessContext = context
  }
})
