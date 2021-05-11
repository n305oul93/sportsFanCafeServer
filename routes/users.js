const express = require('express')
const User = require('../models/user')
const passport = require('passport')
const authenticate = require('../authenticate')

const router = express.Router()

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource')
})

router.post('/signup', (req, res) => {
  // use passport-local-mongoose register plugin to create new User
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    // callback if err from register method, or err will be null if no err
    (err, user) => {
      if (err) {
        res.statusCode = 500 // lets user know not user error but server error
        res.setHeader('Content-Type', 'application/json')
        res.json({ err: err })
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname
        }
        user.save(err => {
          if (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.json({ err: err })
            return
          }
          // below will return function
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json({ success: true, status: 'Registration Successful!' })
          })
        })
      }
    }
  )
})

router.post('/login', passport.authenticate('local'), (req, res) => {
  // once user is verified, issue token passing object that contain payload
  const token = authenticate.getToken({ _id: req.user._id })

  // passport.authenticate will handle logging in of user, challenging for creds, parsing creds from request body
  // all need is to send response, if were errors passport would have already handled
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.json({
    success: true,
    token: token,
    status: 'You are successfully logged in!'
  })
})

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy()
    res.clearCookie('session-id')
    res.redirect('/')
  } else {
    const err = new Error('You are not logged in!')
    err.status = 401
    return next(err)
  }
})

module.exports = router
