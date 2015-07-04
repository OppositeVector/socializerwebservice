var express = require('express');
var url = require('url');
var dbController = require("./DBController");
var service = express();
var actions = require("./Actions")(service, dbController);

var port = process.env.PORT || 3000;

service.get('/register',function (req,res) {

	var urlPart = url.parse(req.url,true);
	var query = urlPart.query;
	if((query.key != null) && (query.pn != null)) {
		actions.Register(query.key, query.pn, res);
		return;
	}

	console.log("Missing parameters on login");
	actions.SendJson({result: 0, data:"Missing parameters"}, res);

});

service.post('/register',function (req,res) {

	if((req.body.key != null) && (req.body.pn)) {
		actions.Register(req.body.key, req.body.pn, res);
		return;
	}

	console.log("Missing parameters on login");
	actions.SendJson({result: 0, data:"Missing parameters"}, res);


});

// Located here because i want the registration paths to come before the session check, skipping it
var sessionController = require("./SessionController")(service, dbController);

service.get('/login',function (req,res) {

	if(req.session.user != null) {
		actions.SendJson({result: 1, data:"Session created"}, res);
		console.log("Session created for user " + req.session.user.phoneNumber);
	} else {
		actions.SendJson({result: 0, data:"Session authentication failed"}, res);
		console.log("Session authentication failed for user " + req.session.user.phoneNumber);
	}

});

service.post('/login',function (req,res) {

	if(req.session.user != null) {
		actions.SendJson({result: 1, data:"Session created"}, res);
		console.log("Session created for user " + req.session.user.phoneNumber);
	} else {
		actions.SendJson({result: 0, data:"Session authentication failed"}, res);
		console.log("Session authentication failed for user " + req.session.user.phoneNumber);
	}
	
});

service.get("/createGroup", function (req, res) {

	var urlPart = url.parse(req.url,true);
	var query = urlPart.query;

	if(query != null) {
		if(query.group != null) {
			actions.CreateGroup(req.session.user, query.group, res);
			return;
		}
	}

	console.log("Missing parameters on createGroup");
	actions.SendJson({result: 0, data:"Missing parameters on /createGroup"}, res);

});

service.post("/createGroup", function (req,res) {
	
	if(req.body != null) {
		if(req.body.group != null) {
			actions.CreateGroup(req.session.user, req.body.group, res);
			return;
		}
	}

	console.log("Missing parameters on createGroup");
	actions.SendJson({result: 0, data:"Missing parameters on /createGroup"}, res);
	
});

service.post("/removeGroup", function (req, res) {

	if(req.body != null) {
		if(req.body.groupName != null) {
			actions.RemoveGroup(req.session.user, req.body.groupName, res);
			return;
		}
	}

	console.log("Missing parameters on removeGroup");
	actions.SendJson({result: 0, data:"Missing parameters on /removeGroup"}, res);
	
});

service.post("/updateGroup", function (req, res) {

	if(req.body != null) {
		if(req.body.group != null) {
			actions.UpdateGroup(req.session.user, req.body.group, res);
			return;
		}
	}

	console.log("Missing parameters on updateGroup");
	actions.SendJson({result: 0, data:"Missing parameters on /updateGroup"}, res);
	
});

service.get("/tester", function(req, res) {

	actions.SendJson({timesViewed: req.session.counter}, res);
	console.log(req.session.counter);

});

service.listen(port, function() {
    console.log('App ready on port: ' + port);
});