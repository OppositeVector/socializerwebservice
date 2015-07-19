var errors = require("./Errors");

var app;
var dbController;

function FindByName(name, array) {
	for(var i = 0; i < array.length; ++i) {
		if(name == array[i].name) {
			return i;
		}
	}
}

module.exports = function(express, mongoose) {

	app = express;
	dbController = mongoose;

	function Actions() {

		function SendJson(json, res) {

			res.header("Access-Control-Allow-Methods", "GET, POST");
			res.header("Access-Control-Allow-Credentials", "true");
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "Content-Type, *");
			// res.header("Access-Control-Allow-Origin","*");
			// res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
			app.set("json spaces",4);
			res.set("Content-Type","application/json");
			res.status(200);
			res.json(json);
		}

		this.SendJson = SendJson;

		this.Register = function(number, key, res) {

			dbController.AddUser({phoneNumber: number, key: key},function(userData){
				if(userData.result == null){
					SendJson({result: 1, data: "Registration successful"},res);
					console.log("register success:"+ userData.phoneNumber);	
				}else{
					SendJson(userData, res);
				}
			});

		}

		this.Login = function(number, key, req, res) {

			dbController.GetUser(number,function(userData){
				if(userData.result != null) {
					SendJson(userData, res);
				} else {
					if(userData.key==key){
						req.session.user = userData;
						console.log("Authentication successfull on user: " + userData);
						SendJson({result: 1, data: "Authentication successfull"}, res);
					}else{
						SendJson(errors.sessionFailed(req.session.user.phoneNumber), res);
					}
				}
			});

		}

		this.CreateGroup = function(user, group, res) {

			var gIndex = FindByName(group.name, user.groups);
			if(gIndex != null) {
				SendJson(errors.groupExists(), res);
			} else {
				console.log(JSON.stringify(user));
				user.groups.push(group);
				dbController.UpdateUser(user, function(userData) {
					if(userData.result == null) {
						SendJson({result:1, data: "Group added"}, res);
					} else {
						SendJson(userData, res);
					}
				});
			}

		}

		this.RemoveGroup = function(user, groupName, res) {

			var gIndex = FindByName(groupName, user.groups);
			if(gIndex != null) {
				user.groups.splice(gIndex, 1);
				dbController.UpdateUser(user, function(userData) {
					if(userData.result == null) {
						SendJson({result:1, data: "Group removed"}, res);
					} else {
						SendJson(userData, res);
					}
				});
			} else {
				SendJson(errors.groupNotFound(), res);
			}

		}

		this.UpdateGroup = function(user, group, res) {

			var gIndex = FindByName(group.name, user.groups);
			if(gindex != null) {
				user.groups[gIndex] = group;
				dbController.UpdateUser(user, function(userData) {
					if(userData.result == null) {
						SendJson({result: 1, data: "Group updated"}, res);
					} else {
						SendJson(userData, res);
					}
				});
			} else {
				SendJson(errors.groupNotFound(), res);
			}

		}

		this.RetrieveGroup = function(user, groupName, res) {

			var gIndex = FindByName(groupName, user.groups);
			if(gIndex == null) {
				SendJson({result:1, data: user.groups[gIndex]}, res);
			} else {
				SendJson(errors.groupNotFound(), res);
			}

		}

	}

	return new Actions();

}