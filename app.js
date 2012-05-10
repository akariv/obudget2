var express = require('express');
var fs = require('fs');
var hulk = require('hulk-hogan');
var util = require('util');

var app = express.createServer();

app.configure(function(){
	app.use(app.router);
	app.use(express.static(__dirname + '/src/app/'));

	app.set('views', __dirname + '/src/app/');
	app.set('view engine', 'html');
	app.set('view options', {layout: false});

	app.register('.html', hulk);
});


//app.all("*", function(req, res) {
//	console.log(req.url);
//});
app.get('/*',function(req,res,next){
    res.header('Content-Length' , 5000 );
    next(); // http://expressjs.com/guide.html#passing-route control
});

app.get('/', function(req, res) {
	res.render("index", {'ogurl': 'http://' + req.headers.host + req.url, 'ogtitle' : 'תקציב המדינה', init_title: "תקציב המדינה", init_url: "/תקציב-המדינה", init_vid: "00"});
});

app.get('/:title', function(req, res){
	// TODO get vid form title
	var vid = "00"
	res.render("index", {'ogurl': 'http://' + req.headers.host + req.url, 'ogtitle' : req.params.title, init_title: req.params.title, init_url: req.params.title, init_vid: vid});
});


app.listen(process.env.VCAP_APP_PORT || 3000);

//function virtualToPhysical(path) {
//    return __dirname + '/src/app' + path;
//}
