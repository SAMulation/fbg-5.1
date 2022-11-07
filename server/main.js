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
app.post('/pusher/user-auth', (req, res) => {
  const socketId = req.body.socket_id
  // Replace this with code to retrieve the actual user id and info
  const user = {
    id: '12345',
    user_info: {
      name: 'John Smith'
    }
  }
  const authResponse = pusher.authenticateUser(socketId, user)
  res.send(authResponse)
})
app.post('/pusher/auth', (req, res) => {
  const socketId = req.body.socket_id
  const channel = req.body.channel_name
  const authReponse = pusher.authorizeChannel(socketId, channel)
  res.send(authReponse)
})

module.exports.handler = serverless(app)
