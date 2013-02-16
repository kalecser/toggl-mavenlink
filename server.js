_u = require("./underscore.js");

var express = require('express');
var app = express();

var static = require('node-static');
var file = new(static.Server)('./');


app.use(express.bodyParser());

app
.post('/toggl', function (req, resp){
	toggl(req.body, resp);
})
.get("/*", function (req, resp){
	file.serve(req, resp);
}).listen(8000);


var toggl = function(req, resp){

var request = require('request'),
    password = "api_token",
    username = req.togglToken,
    url = "https://www.toggl.com/api/v6/time_entries.json",
    auth = "Basic " + new Buffer(username + ":" + password).toString("base64");

request(
    {
        url : url,
        headers : {
            "Authorization" : auth
        }
    },
    function (error, response, body) {


	try {
		var result = _u(JSON.parse(body).data).map(function(entry) {
			return [entry.description,
				entry.start.substring(0,10),
				(entry.duration / 60) /60 ]	
		});
		resp.json(result);
	}catch (ex) {
		resp.json({error: 'Error accessing toggl, your api token : ' + req.togglToken + ' may not be valid'});
	}

    }
);
	
};
