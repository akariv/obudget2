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
    //res.header('Content-Length' , 5000 );
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
	res.render("index", {'ogurl': 'http://' + req.headers.host + req.url, 'ogtitle' : req.params.title, init_title: req.params.title, init_url: req.params.title + "?vid=" + vid, init_vid: vid});
});


app.get('/data/:bgt', function(req, res){
	var query = req.query;
	var callback = query.callback;

	var data = null;
	console.log(req.params.bgt)
	fs.readFile('src/test-server/data/virtual_items_' + req.params.bgt.substring(0,8) + '.json', 'utf-8', function(err,data){
	  if(err) {
	    console.error("Could not open file: %s", err);
		res.writeHead(500);
	    res.end('Internal Server Error');
	  } else {
		vitems = JSON.parse(data);
		res.writeHead(200);
		var response = "";
		if (callback === undefined) {
			response = JSON.stringify(getVirtualItem(req.params.bgt,vitems));
		} else {
			response = callback + "(" + JSON.stringify(getVirtualItem(req.params.bgt,vitems)) + ")"
		}
		res.end(response);
	  }

	});
});

app.listen(process.env.VCAP_APP_PORT || 3000);

//function virtualToPhysical(path) {
//    return __dirname + '/src/app' + path;
//}

function getVirtualItem(virtualId, data){
    for (var i = 0; i < data.length; i++) {
        if (data[i].virtual_id === virtualId) {
            return data[i];
        }
    }
    return null;
}