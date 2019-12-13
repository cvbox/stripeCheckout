var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var FileStreamRotator = require('file-stream-rotator');
var fs = require('fs');
var helmet = require('helmet');
const config = require('config-lite')(__dirname)

var payRouter = require('./routes/pay');


var app = express();
app.use(helmet({
    frameguard: {
        action: 'deny'
    }
}));
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.2.0' }))
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var logDirectory = __dirname + '/log';
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
// create a rotating write stream
var accessLogStream = FileStreamRotator.getStream({
    date_format: 'YYYYMMDD',
    filename: logDirectory + '/%DATE%.log',
    frequency: 'daily',
    verbose: false
});


logger.token('uid', function (req, res) {
    return req.user ? req.user._id : '-';
});

logger.token('params', function (req, res) {
    return JSON.stringify(req.body) || '-';
});


logger.format('mylog', ':date[iso],:remote-addr,:uid,:method,:url,:status,:res[content-length],:response-time,:referrer,:user-agent');

// setup the logger
app.use(logger('mylog', {stream: accessLogStream}));

app.use(logger('mylog'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));


// cors跨域
app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf-8");
    next()
});


app.use('/pay/', payRouter);


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
    res.render('error');
});

function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.status(401).send("Unauthorized");
    }
}

console.log('env',config.env)


module.exports = app;
