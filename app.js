// this file pretty much does nothing, all the fun stuff happens in /routes/index.js

let express = require('express');
let path = require('path');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let cors = require('cors');
let index = require('./routes/index')

let app = express();

app.use(cors());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
});


app.use(express.static(path.join(__dirname, '/public'))); // ! ! this has to be declared last or else it just serves index.html when going to root website directory

module.exports = app;
