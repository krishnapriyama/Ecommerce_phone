var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('express-handlebars')
var fileUpload = require('express-fileupload')
var db = require('./config/connection')
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin');
var session = require('express-session')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
    helpers: {
      // Function to do basic mathematical operation in handlebar
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
      stringCompare: function (value1, value2) {
        if (value1 == value2) {
          return true
        }
        else {
          return false
        }
      },
      stringnotEquallCompare: function (value1, value2) {
        if (value1 != value2) {
          return true
        }
        else {
          return false
        }
      },
      logical: function (left, opertor, right) {
        if (opertor == "<") {
          console.log("----------", left, opertor, right);
          if (left < right) {
            return true;
          } else {
            return false;
          }
        }
      },
      logicalOperation: function (left, opertor, right) {
        if (opertor == ">") {
          console.log("----------", left, opertor, right);
          if (left > right) {
            return true;
          } else {
            return false;
          }
        }
      }
    }
  })
);


app.use(session({
  secret: "Key",
  resave: false,
  saveUninitialized: true

}))
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())

db.connect((err) => {
  if (err) console.log("Connection Failed");
  else console.log("Connection Sucessfully Installed");
})

app.use('/', usersRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{errorstatus:true});
});

module.exports = app;
