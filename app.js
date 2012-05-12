var express = require('express');
var fs = require('fs');
var hulk = require('hulk-hogan');
var util = require('util');
var request = require('request')

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
	console.log(req.url);
	res.render("index", {'ogurl': 'http://' + req.headers.host + req.url, 'ogtitle' : 'תקציב המדינה', init_title: "תקציב המדינה", init_url: "המדינה", init_vid: "00"});
});

app.get('/:title', function(req, res){
	console.log(req.param.title);
	// TODO get vid form title
	// TODO filter out requests like favicon.ico
	//http://api.yeda.us/data/hasadna/budget-ninja/?o=jsonp&callback=jsonp1336632333921&query=%7B%22title%22%3A%22%D7%9E%D7%A9%D7%A8%D7%93+%D7%94%D7%97%D7%99%D7%A0%D7%95%D7%9A%22%7D
	var title = req.params.title.replace("-", " ");
	var ninja_req = 'http://api.yeda.us/data/hasadna/budget-ninja/?o=json&query=%7B%22title%22%3A%22' + encodeURI(title) + '%22%7D';

	console.log(ninja_req);
	request(ninja_req, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    console.log(body) // Print the google web page.
	  }
	})
	var vid = "00"
	res.render("index", {'ogurl': 'http://' + req.headers.host + req.url, 'ogtitle' : req.params.title, init_title: req.params.title, init_url: req.params.title, init_vid: vid});
});


app.listen(process.env.VCAP_APP_PORT || 3000);

//function virtualToPhysical(path) {
//    return __dirname + '/src/app' + path;
//}
