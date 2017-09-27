var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
// var users = require('./routes/users');
var postGresClient = require('./public/lib/PostGresqlConnect');
var client = postGresClient.getpostGresqlClient();
var login=require('./public/lib/login');
var fetch_event=require('./public/lib/fetch_event');
var save_profile=require('./public/lib/save_profile');

var app = express();


// view engine setup
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

app.post('/login',function(req,res)
{
    var id=req.id;

login.check_login(id,function onComplete(result){

    res.json(result);
});

});




app.post('/fetch_event',function(req,res)
    {
        var id=req.id;
        fetch_event.fetch_event(id,function onComplete(result){

            res.json(result);
        });



    });

app.post('/save_profile',function(req,res){
  var id=req.id;
  save_profile.save_profile(id,data,function onComplete(result){
    res.json(result);
  });

});





// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
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
