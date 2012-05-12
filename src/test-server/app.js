var connect = require('connect')
  , http = require('http');

var url = require('url');

var app = connect()
	.use(connect.favicon())
	.use(connect.logger('dev'))
//	.use(connect.static('data'))
	.use(function(req, res){

		var url_parts = url.parse(req.url, true);
		var query = url_parts.query;
		var callback = query.callback;

		var data = null;
		try {
			data = require('.' + url_parts.pathname);
			res.writeHead(200);
			res.end(callback + "(" + JSON.stringify(data.data) + ")");
		} catch (err) {
			dumpError(err);
			res.writeHead(500);
		    res.end('Internal Server Error');
		}

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
