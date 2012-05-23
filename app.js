var express = require('express');
var fs = require('fs');
var hulk = require('hulk-hogan');
var util = require('util');
var request = require('request')

var app = express.createServer();
var itemsByTitle = 123;

fs.readFile('virtual_items_by_title.json', 'utf-8', function(err,data){
  if(err) {
    console.log("Could not open file: %s", err);
  } else {
	itemsByTitle = JSON.parse(data);
  }});


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
	var vid = "bgt-00"
	res.render("index", {'ogurl': 'http://' + req.headers.host + req.url, 'ogtitle' : 'תקציב המדינה', init_title: "תקציב המדינה", init_url: "המדינה"  + "?vid=" + vid, init_vid: vid});
});

app.get('/:title', function(req, res){
	// TODO filter out requests like favicon.ico
	console.log(req.params.title);
	var title = req.params.title.replace(/-/g, " ");

	// TODO get vid form title
	var potentialIds = itemsByTitle[title];
	if (!potentialIds){
		console.log("couldn't find title " + title);
		// TODO gracefully fallback for default budget item if the requested title can't be found
		res.status(500);
		res.render('index', { });
	    return;
	}

	if (potentialIds.virtual_ids.length > 1){
		console.log("WARNING: more than one virtual_id for title '" + title + "'");
	}
	var vid = potentialIds.virtual_ids[0];

	console.log(potentialIds);
	console.log("** vid == "+vid);
	//http://api.yeda.us/data/hasadna/budget-ninja/?o=jsonp&callback=jsonp1336632333921&query=%7B%22title%22%3A%22%D7%9E%D7%A9%D7%A8%D7%93+%D7%94%D7%97%D7%99%D7%A0%D7%95%D7%9A%22%7D
	//var ninja_req = 'http://api.yeda.us/data/hasadna/budget-ninja/?o=json&query=%7B%22title%22%3A%22' + encodeURI(title) + '%22%7D';
	var ninja_req = 'http://127.0.0.1/' + vid;

	console.log(ninja_req);
	request(ninja_req, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    console.log(body) // Print the google web page.
	  }
	})
	res.render("index", {'ogurl': 'http://' + req.headers.host + req.url, 'ogtitle' : req.params.title, init_title: req.params.title, init_url: req.params.title + "?vid=" + vid, init_vid: vid});
});


app.listen(process.env.VCAP_APP_PORT || 3000);

//function virtualToPhysical(path) {
//    return __dirname + '/src/app' + path;
//}
