var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs= require('express-handlebars')
let session=require('express-session')
var db=require('./config/mongodb')
var fileUpload=require('express-fileupload')
const dotenv= require('dotenv').config()

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine(
  "hbs",
  hbs({
    helpers: {
      math: function (lvalue, operator, rvalue) {
        lvalue = parseFloat(lvalue);
        rvalue = parseFloat(rvalue);
        return {
          "+": lvalue + rvalue,
          "-": lvalue - rvalue,
          "*": lvalue * rvalue,
          "/": lvalue / rvalue,
          "%": lvalue % rvalue,
        }[operator];
      },
      ifEquals: function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
      }
    },
    extname: "hbs",
    defaultLayout: "layout",
    layoutDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials",
  })
);
// app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials/'}))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({key:'admin',secret:'onlyadmin',cookie:{
path:'/admin',maxAge:6000000}}))
app.use(session({key:'user',secret:'onlyuser',cookie:{
  path:'/',maxAge:6000000}}))
db.connect((err)=>{
  console.log('connected successfully');
  })

app.use('/', userRouter);
app.use('/admin', adminRouter);

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
