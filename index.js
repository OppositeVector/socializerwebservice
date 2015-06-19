var express = require('express');
var url = require('url');
var dbController = require('./DBController');
var service = express();
var port = process.env.PORT || 3000;

/*
	Response format { result: 0 / 1, data: { Data block requested }}
*/

function FindByName(name, array) {
	for(var i = 0; i < array.length; ++i) {
		if(name == array[i].name) {
			return i;
		}
	}
}

function SendJson(json,res){
	res.header("Access-Control-Allow-Origin","*");
	res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
	service.set("json spaces",4);
	res.set("Content-Type","application/json");
	res.status(200);
	res.json(json);
}

function ProcessRegister(key, number, res) {

	dbController.AddUser({phoneNumber: number, key: key},function(userData){
		if(userData.err!=null){
			console.log("Error registering: " + userData.err.msg);
			SendJson({result: 0, data: userData }, res);
		}else{
			SendJson({result: 1, data: "Registration successful"},res);
			console.log("register success:"+ userData.phoneNumber);	
		}
	});

}

function ProcessLogin(key, number, res) {

	dbController.GetUser(number,function(userData){
		if(userData.err != null) {
			SendJson({result: 0, data: userData}, res);
		} else {
			if(userData.key==key){
				SendJson({ result:1, data:userData },res);
			}else{
				SendJson({ result:0, data:"Login failed" },res);
				console.log("authentication failure");
			}
			console.log("Done with login");
		}
	});

}

function ProcessCreateGroup(key, number, group, res) {

	dbController.GetUser(number, function(user) {
		if(user.err != null) {
			SendJson({result:0, data: user}, res);
		} else {
			if(user.key == key) {
				var gIndex = FindByName(group.name, user.groups);
				if(gIndex != null) {
					SendJson({result:0, data: "Group already exists"}, res);
				} else {
					user.group.push(group);
					dbController.UpdateUser(user, function(u) {
						if(u.err != null) {
							SendJson({resut:0, data: u},res);
						} else {
							SendJson({result:1, data: "Group added"}, res);
						}
					});
				}
			} else {
				SendJson({result:0, data: "Authentication failed"}, res);
			}
		}
	});

}

function ProccessRemoveGroup(key, number, groupName, res) {

	dbController.GetUser(number, function(user) {
		if(user.err != null) {
			SendJson({result:0, data: user}, res);
		} else {
			if(user.key = key) {
				var gIndex = FindByName(groupName, user.groups);
				if(gIndex != null) {
					user.groups.splice(gIndex, 1);
					dbController.UpdateUser(user, function(u) {
						if(u.err != null) {
							SendJson({result:0, data: u}, res);
						} else {
							SendJson({Result:1, data: "Group removed"}, res);
						}
					});
				} else {
					SendJson({result:0, data: "Group not found"}, res);
				}
			} else {
				SendJson({result: 0, data: "Authentication failed"}, res);
			}
		}
	});

}

function ProcessUpdateGroup(key, number, group, res) {

	dbController.GetUser(number, function(user) {
		if(user.err == null) {
			if(user.key == key) {
				var gIndex = FindByName(group.name, user.groups);
				if(gindex != null) {
					user.groups[gIndex] = group;
					dbController.UpdateUser(user, function(u) {
						if(u.err != null) {
							SendJson({result: 1, data: "Group updated"}, res);
						} else {
							SendJson({result:0, data: u}, res);
						}
					});
				} else {
					SendJson({result:0, data: "Group not found"}, res);
				}
			} else {
				SendJson({result:0, data: "Authentication failed"}, res);
			}
			
		} else {
			SendJson({result:0, data: user}, res);
		}
	});

}

service.use("/", express.static("./../app"));

service.get('/register',function (req,res) {

	var urlPart = url.parse(req.url,true);
	var query = urlPart.query;
	if((query.key != null) && (query.pn != null)) {
		ProcessRegister(query.key, query.pn, res);
	} else {
		SendJson({result: 0, data:"Missing parameters"}, res);
	}

});

service.post('/register',function (req,res) {

	if((req.body.key != null) && (req.body.pn)) {
		ProcessRegister(req.body.key, req.body.pn, res);
	} else {
		SendJson({result: 0, data:"Missing parameters"}, res);
	}

});

service.get('/login',function (req,res) {

	var urlPart = url.parse(req.url,true);
	var query = urlPart.query;
	if((query.key != null) && (query.pn != null)) {
		ProcessLogin(query.key, query.pn, res);
	} else {
		SendJson({result: 0, data:"Missing parameters"}, res);
	}

});

service.post('/login',function (req,res) {

	if((req.body.key != null) && (req.body.pn != null)) {
		ProcessLogin(req.body.key, req.body.pn, res);
	} else {
		SendJson({result: 0, data:"Missing parameters"},res );
	}
	
});

service.post("/createGroup", function (req,res) {
	
	if(req.body != null) {
		if((req.body.key != null) && (req.body.pn != null) && (req.body.group != null)) {
			ProcessCreateGroup(req.body.key, req.body.pn, req.body.group, res);
			return;
		}
	}

	SendJson({result: 0, data:"Missing parameters"}, res);
	
});

service.post("/removeGroup", function (req, res) {
	if((req.body.key != null) && (req.body.pn != null) && (req.body.groupName != null)) {
		ProccessRemoveGroup(req.body.key, req.body.pn, req.body.groupName, res);
	} else {
		SendJson({result: 0, data:"Missing parameters"}, res);
	}
});

service.post("/updateGroup", function (req, res) {
	if((req.body.key != null) && (req.body.pn != null) && (req.body.group != null)) {
		ProcessUpdateGroup(req.body.key, req.body.pn, req.body.group, res);
	} else {
		SendJson({result: 0, data:"Missing parameters"}, res);
	}
});

// service.get('/removeGroup',function (req,res){

// 	var urlPart = url.parse(req.url,true);
// 	var query = urlPart.query;
// 	if((query.pn!=null)&&(query.n!=null)){
// 		dbController.GetUser(query.pn,function(userData){
// 			if(userData.key==query.key){
// 				dbController.RemoveGroup(query.pn,query.n);
// 				SendJson({
// 					result:1,
// 					data:"group "+query.n+" successfuly removed"
// 				},res);
// 			}else{
// 				SendJson({
// 					result:0,
// 					data:"invalid key"
// 				},res);
// 				console.log("key authentication failure");
// 			}
// 		});
// 	}else{
// 		SendJson({
// 					result:0,
// 					data:"missing prarameters"
// 				},res);
// 	}


// });

/*
service.get('/addContact',function (req,res){

	var urlPart = url.parse(req.url,true);
	var query = urlPart.query;
	if((query.pn!=null)&&(query.n!=null)){
		dbController.GetUser(query.pn,function(userData){
			if(userData.key==query.key){
				var contactDetails = {contactName:query.cn,
									contactPhoneN
									whatsapp:query.fw};
				dbController.RemoveGroup(query.pn,{name:query.n,frequency:frequency});
				SendJson({
					result:1,
					data:"group "+query.n+" successfuly removed"
				},res);
			}else{
				SendJson({
					result:0,
					data:"invalid key"
				},res);
				console.log("key authentication failure");
			}
		});
	}else{
		SendJson({
					result:0,
					data:"missing prarameters"
				},res);
	}


});*/




service.listen(port, function() {
    console.log('App ready on port: ' + port);
});