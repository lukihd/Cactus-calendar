const createError = require('http-errors');
const express = require('express');
const expressHbs = require('express-handlebars');
const methodOverride = require('method-override')
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session')
const passport = require('passport')

// routes
const indexRouter = require('./routes/index');
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');

let app = express();

// passport config
require('./config/passport')(passport)

// mongoose connection
mongoose.connect("mongodb://mongo:27017/cactus-calendar", {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log("Connection to mongodb established"))
  .catch((err) => console.log("Error : " + err));
mongoose.set('useFindAndModify', false);

// express session
app.use(session({
  // make cookie true if had an https connection only
  cookie: {secure: false},
  resave: false,
  saveUninitialized: false,
  secret: "PyzD71MHh7unBTQAaqa2psDfWKdErpgCuoQmYgrKqsOgi4HzkK5KEnMA6guLPdytSgkAgTG8ZOPoBYiYG2ttAdULpop7RbP7rQDuCl9wSHohaX2uMbXWeWhQYNXlJIULZfR8e3sVToeQFgmcDLM7PeW85drqpq1U3w1J179IcUfkpqg15kxaITTYq3VrbzUq0PRqnfEIK07xymT5il8bN0M1wnfq1ZWku5P1c46ODFheq2y28ZJDdVdpAC9MT0K1"
}))

// flash
app.use(flash())

// passport
app.use(passport.initialize())
app.use(passport.session())


// global vars
app.use((req, res, next) => {
  res.locals.success_message = req.flash('success_message')
  res.locals.error_message = req.flash('error_message')
  res.locals.error = req.flash('error')
  next()
})

// view engine setup
app.engine('.hbs', expressHbs({defaultLayout: 'layout', extname: '.hbs'}));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());

// body parser
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'))

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/task', taskRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
