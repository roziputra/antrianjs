var createError = require('http-errors');
var express = require('express');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var compression = require('compression');
var fs = require('fs');

var app = express();

var ctrl = require('./routes/index');

app.io = ctrl.io;

// view engine setup
app.set('views', path.join(__dirname, 'views').replace('/app.asar', ''));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/assets/js', express.static(path.join(__dirname, 'public', 'javascripts').replace('/app.asar', '')));
app.use('/assets/css', express.static(path.join(__dirname, 'public', 'stylesheets').replace('/app.asar', '')));
app.use('/assets/img', express.static(path.join(__dirname, 'public', 'images').replace('/app.asar', '')));
app.use('/assets/origin', express.static(path.join(__dirname, 'public', 'origin')));
app.use('/assets/s', express.static(path.join(__dirname, 'public', 'suara').replace('/app.asar', '')));
app.use('/assets/fonts', express.static(path.join(__dirname, 'public', 'fonts').replace('/app.asar', '')));

app.use(function (req, res, next) {
	let config = {
		nama: "Kabupaten Aceh Barat Daya",
		copyright: "Copyright &copy; 2022 alfatihsolusi.com All rights reserved.",
	}

	res.locals.config = config;
	next();
});

app.use('/', ctrl);

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

console.log(path.resolve('./'));
let keygen = fs.existsSync('./keygen') ?
	fs.readFileSync('./keygen') :
	null;
console.log(keygen);
app.machine = (gen) => { if (gen == keygen) return 1; else return 0; }
module.exports = app;