var createError = require('http-errors')
var express = require('express')
var path = require('path')
// var cookieParser = require('cookie-parser')
var logger = require('morgan')
const session = require('express-session')
const FileStore = require('session-file-store')(session)

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')
const blogRouter = require('./routes/blogRouter')

// setup mongoose
const mongoose = require('mongoose')

const mongoUrl = 'mongodb://localhost:27017/sportsFanCafe'
const connect = mongoose.connect(mongoUrl, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
})

connect.then(
  () => console.log('Connected to MongoDB'),
  err => console.log(err)
)

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// can be conflicts if use cookieParser & Sessions at same time
// app.use(cookieParser('12345-67890-09876-54321'))

// will automatically add session to request
app.use(
  session({
    name: 'session-id', // name doesn't matter
    secret: '12345-67890-09876-54321',
    saveUninitialized: false,
    resave: false,
    store: new FileStore()
  })
)

// where add authentication
function auth(req, res, next) {
  console.log(req.session)
  // signedCookies provided by cookieParser middleware, will parse signed cookie from request, if not properly signed will return false; user is property we are adding to signed cookie
  // not using cookies so signedCookies not available
  // if (!req.signedCookies.user) {
  if (!req.session.user) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      const err = new Error('You are not authenticated!')
      res.setHeader('WWW-Authenticate', 'Basic')
      err.status = 401
      return next(err)
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64')
      .toString()
      .split(':')
    const user = auth[0]
    const pass = auth[1]
    if (user === 'admin' && pass === 'password') {
      // correct username & password entered, setup cookie
      // res.cookie apart of express response object API
      // pass name of cookie, value to store in name property
      // res.cookie('user', 'admin', { signed: true })
      req.session.user = 'admin'
      return next() // user was authorized
    } else {
      const err = new Error('You are not authenticated!')
      res.setHeader('WWW-Authenticate', 'Basic')
      err.status = 401
      return next(err)
    }
  } else {
    // this means there is a signed cookie in the request
    // not using cookies
    // if (req.signedCookies.user === 'admin') {
    if (req.session.user === 'admin') {
      return next()
    } else {
      const err = new Error('You are not authenticated!')
      err.status = 401
      return next(err)
    }
  }
}

app.use(auth)

app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/blog', blogRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
