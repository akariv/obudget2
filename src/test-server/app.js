var connect = require('connect')
  , http = require('http');

var url = require('url');
var fs = require('fs');

var app = connect()
	.use(connect.favicon())
	.use(connect.logger('dev'))
	.use(function(req, res){

		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		var callback = query.callback;

		var data = null;
		console.log(url_parts.pathname)
		fs.readFile('./data/virtual_items_' + url_parts.pathname.substring(1,9) + '.json', 'utf-8', function(err,data){
		  if(err) {
		    console.error("Could not open file: %s", err);
			dumpError(err);
			res.writeHead(500);
		    res.end('Internal Server Error');
		  } else {
			vitems = JSON.parse(data);
			res.writeHead(200);
			res.end(callback + "(" + JSON.stringify(getVirtualItem(url_parts.pathname.substring(1),vitems)) + ")");
		  }

		});
	});
app.listen(8080);

function dumpError(err) {
	if (typeof err === 'object') {
		if (err.message) {
			console.log('\nMessage: ' + err.message)
		}
		if (err.stack) {
			console.log('\nStacktrace:')
			console.log('====================')
			console.log(err.stack);
		}
	} else {
		console.log('dumpError :: argument is not an object');
	}
}

function getVirtualItem(virtualId, data){
    for (var i = 0; i < data.length; i++) {
        if (data[i].virtual_id === virtualId) {
            return data[i];
        }
    }
    return null;
}