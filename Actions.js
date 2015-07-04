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

module.exports = function(express, mongoose) {

	var app = express;
	var dbConotrller = mongoose;

	function Actions() {

		this.SendJson = function(json,res){
			res.header("Access-Control-Allow-Origin","*");
			res.header("Access-Control-Allow-Headers","Origin, X-Requested-With, Content-Type, Accept");
			app.set("json spaces",4);
			res.set("Content-Type","application/json");
			res.status(200);
			res.json(json);
		}

		this.Register = function(key, number, res) {

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

		this.CreateGroup = function(user, group, res) {

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

		}

		this.RemoveGroup = function(user, groupName, res) {

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

		}

		this.UpdateGroup = function(user, group, res) {

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

	}

	return new Actions();

}