var express = require('express');
var app = express.createServer();
app.get('/', function(req, res) {
    res.send('Hello from Cloud Foundry');
});

app.configure(function(){
    app.use(express.static(__dirname + '/src/app/'));
    }
);

app.listen(process.env.VCAP_APP_PORT || 3000);