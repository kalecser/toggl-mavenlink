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
.post('/mavenlink', function(req, resp){
	mavenlink(req.body, resp);
})
.get("/*", function (req, resp){
	file.serve(req, resp);
}).listen(8000);


var toggl = function(req, resp){

	var url = "https://www.toggl.com/api/v6/time_entries.json";
	var onResponse = function(body, resp) {
		var result = _u(JSON.parse(body).data).map(function(entry) {
			return [
				entry.start.substring(0,10).replace(/-/g, "/"),
				((entry.duration / 60) /60) < 0? 0: ((entry.duration / 60) /60) ]	
		});
		resp.json(result);
		};

	requestWithBasicAuth(req.togglToken, "api_token", url, onResponse, resp);

};

var mavenlink = function(req, resp){
 	var url = "https://www.mavenlink.com/api/v0/workspaces.json";
	var mavenlinkToken = req.mavenlinkToken;
	var mavenlinkUser = req.mavenlinkUser;
        var onResponse = function(body, resp) {
		var workspace = JSON.parse(body)[0].id;
		requestWithBasicAuth(mavenlinkUser, mavenlinkToken, "https://www.mavenlink.com/api/v0/workspaces/" + workspace + "/time_entries.json", 
		function(tbody, resp) {
			var result = JSON.parse(tbody).map(function(timeEntry){
				return [timeEntry.date_performed, 
					timeEntry.time_in_minutes/60];
			});
			resp.json(result);
		}, resp);
        };

        requestWithBasicAuth(mavenlinkUser, mavenlinkToken,  url, onResponse, resp);
};

var requestWithBasicAuth = function(username, password, url, onResponse, resp) {
		if (resp == null) throw "resp is required";
		var request = require('request'),
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
				onResponse(body, resp);
			}catch (ex) {
				resp.json({error: 'Error accessing remote service, check your user/pass : ' + username + ':' + password + ' may not be valid<br>' + ex });
			}

		    }
		);
	};
