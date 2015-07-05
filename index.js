var express = require('express');
var url = require('url');
var dbController = require("./DBController");
var app = express();
var service = require("./ServiceController")(app, dbController);
var errors = require("./Errors");

var port = process.env.PORT || 3000;

function NonSessioned() {

	console.log("non sessioned");

	app.get('/register',function (req,res) {

		var urlPart = url.parse(req.url,true);
		var query = urlPart.query;
		if((query.key != null) && (query.pn != null)) {
			service.Register(query.pn, query.key, res);
			return;
		}

		service.SendJson(errors.missingParameter("register"), res);

	});

	app.post('/register',function (req,res) {

		if((req.body.key != null) && (req.body.pn)) {
			service.Register(req.body.pn, req.body.key, res);
			return;
		}

		service.SendJson(errors.missingParameter("register"), res);


	});

}

function Sessioned() {

	console.log("sessioned");

	app.get('/login', function (req,res) {

		var urlPart = url.parse(req.url,true);
		var query = urlPart.query;
		if((query.pn != null) && (query.key != null)) {
			service.Login(query.pn, query.key, req, res);
		}else {
			service.SendJson(errors.missingParameter("login"), res);
		}

	});

	app.post('/login', function (req,res) {

		console.log(JSON.stringify(req.body));
		console.log(req.url);
		console.log(JSON.stringify(req.headers));

		if(req.body != null) {
			if((req.body.pn != null) && (req.body.key != null)) {
				service.Login(req.body.pn, req.body.key, req, res);
				return;
			}
		}
		
		service.SendJson(errors.missingParameter("login"), res);

	});

}

function AuthenticatedSession() {

	console.log("authenticated");

	app.get("/createGroup", function (req, res) {

		var urlPart = url.parse(req.url,true);
		var query = urlPart.query;

		if(query != null) {
			if(query.group != null) {
				service.CreateGroup(req.session.user, query.group, res);
				return;
			}
		}

		service.SendJson(errors.missingParameter("createGroup"), res);

	});

	app.post("/createGroup", function (req,res) {
		
		if(req.body != null) {
			if(req.body.group != null) {
				service.CreateGroup(req.session.user, req.body.group, res);
				return;
			}
		}

		service.SendJson(errors.missingParameter("createGroup"), res);
		
	});

	app.post("/removeGroup", function (req, res) {

		if(req.body != null) {
			if(req.body.groupName != null) {
				service.RemoveGroup(req.session.user, req.body.groupName, res);
				return;
			}
		}

		service.SendJson(errors.missingParameter("removeGroup"), res);
		
	});

	app.post("/updateGroup", function (req, res) {

		if(req.body != null) {
			if(req.body.group != null) {
				service.UpdateGroup(req.session.user, req.body.group, res);
				return;
			}
		}

		service.SendJson(errors.missingParameter("updateGroup"), res);
		
	});

	app.get("/retriveAll", function (req, res) {
		var retVal = req.session.user.groups;
		service.SendJson(retVal, res);
	});

	app.get("/retrieveGroup", function (req, res) {

		if(req.body != null) {
			if(req.body.groupName != null) {
				service.RetrieveGroup(req.session.user, req.body.groupName, res);
				return;
			}
		}

		service.SendJson(errors.missingParameter("retrieveGroup"), res);

	});

	app.get("/tester", function(req, res) {

		service.SendJson({timesViewed: req.session.counter}, res);
		console.log(req.session.counter);

	});

}

// Located here because i want the registration and login paths to come before the session check, skipping it
var sessionController = require("./SessionController")(app, dbController, service, NonSessioned, Sessioned, AuthenticatedSession);


app.listen(port, function() {
    console.log('App ready on port: ' + port);
});