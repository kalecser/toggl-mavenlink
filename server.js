var express = require('express');
var app = express();

var static = require('node-static');
var file = new(static.Server)('./');


app.use(express.bodyParser());

app
.post('/toggl', function (req, resp){
	var i = 0;
	
	resp.json({
		data: 'foo',
		output: 'got timelog from toggl'});
})
.get("/*", function (req, resp){
	file.serve(req, resp);
}).listen(8000);
