var createError = require('http-errors')
var express = require('express')
var path = require('path')
// var cookieParser = require('cookie-parser')
var logger = require('morgan')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const passport = require('passport')
const authenticate = require('./authenticate')

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

// only used if using session based auth
app.use(passport.initialize())
app.use(passport.session())

app.use('/', indexRouter)
app.use('/users', usersRouter)

// where add authentication
function auth(req, res, next) {
  console.log(req.headers)
  console.log(req.sessions)
  console.log(req.user)
  if (!req.user) {
    const err = new Error('You are not authenticated!')
    err.status = 401
    return next(err)
  } else {
    return next()
  }
}

app.use(auth)

app.use(express.static(path.join(__dirname, 'public')))

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
