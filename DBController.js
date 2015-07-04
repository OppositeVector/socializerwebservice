var mongoose = require('mongoose');
var user = require('./schemas/userSchema');
var group = require('./schemas/groupSchema');
var contact = require('./schemas/contactSchema');

var uri = "mongodb://ds039281.mongolab.com:39281/heroku_app37608389";
var dbUser = process.env.DB_USER || "WebServiceUser";
var dbPass = process.env.DB_PASSWORD || "ifyouwannashotshotdontt4lk";
var options = {
	server: { },
	replset: { },
	user: dbUser,
	pass: dbPass
}
options.server.socketOptions = options.replset.socketOptions = { keepAlive: 1 };

mongoose.connect(uri, options);

var con = module.exports.connection = mongoose.connection;

var userModel = mongoose.model('userM',user.userSchema);
// var groupModel = mongoose.model('groupM',group.groupSchema);
// var contactModel = mongoose.model('contactM',contact.contactSchema);

con.once('open',function(err){

	if(err!=null){
		console.log(err);
	}else{
		console.log('Successfully opened db connection, user: ' + dbUser + ", pass: " + dbPass);
	}

});

function FindByName(name, array) {
	for(var i = 0; i < array.length; ++i) {
		if(name == array[i].name) {
			return i;
		}
	}
}

function FindByNumber(number, array) {
	for(var i = 0; i < array.length; ++i) {
		if(number == array[i].phoneNumber) {
			return i;
		}
	}
}

function QueryUserAndExecute(phone, dependency) {

	TryFindUser(phone, function(user) {

		if(user == null) {

			var m = "User " + phone + " was not found";
			console.log("4: " + m);
			dependency({err: 4, msg: m});

		} else {
			dependency(user);
		}

	});

}

function TryFindUser(phone, dependency) {

	userModel.findOne().where("phoneNumber").equals(phone).exec(function(err, doc) {

		if(err != null) {

			var m = "Querying user " + phone + " returned an error -- " + err;
			console.log("1: " + m);
			dependency({err: 1, msg: m});

		} else {
			dependency(doc);
		}

	});

}

// Callback will recieve the document of the user
exports.AddUser = function(userObj, callback) {

	TryFindUser(userObj.phoneNumber, function(user) {

		if(user == null) {

			userModel.create({phoneNumber:userObj.phoneNumber, key: userObj.key, groups:[], contacts:[]},function(err, doc) {

				if(err == null) {

					if(callback != null) {
						callback(doc);
					}

				} else {

					var m = "Error creating user -- " + err;
					console.log("2: " + m);
					if(callback != null) {
						callback({err: 2, msg: m});
					}

				}

			});

		} else {

			if(user.err != null) {
				callback(user);
			}

			var m = "User " + userObj.phoneNumber + " already exists";
			console.log("3: " + m);
			if(callback != null) {
				callback({err: 3, msg: m});
			}

		}

	});

}

// Callback will recieve the document of the user
exports.GetUser = function(username, callback) {

	QueryUserAndExecute(username, function(user) {

		if(callback != null) {
			callback(user);
		}
		
	});

}

exports.UpdateUser = function(user, callback) {

	user.save(function(err, doc) {

		if(err != null) {

			var m = "Could not update user, error: " + err;
			console.log("4: " + m);
			if(callback != null) {
				callback({err: 4, msg: m});
			}

		} else {
			if(callback != null) {
				callback(user);
			}
		}

	});

}

exports.AddGroup = function(username, group, callback) {

	if(group.frequency != null) {
		if(group.frequency.calls == null) {
			group.frequency.calls = 2;
		}
		if(group.frequency.whatsapp == null) {
			group.frequency.whatsapp = 2;
		}
		if(group.frequency.sms == null) {
			group.frequency.sms = 2;
		}
	} else {
		group.frequency = {calls: 2, whatsapp: 2, sms: 2};
	}

	QueryUserAndExecute(username, function(user) {

		if(user.err != null) {
			if(callback != null) {
				callback(user);
			}
		} else {

			var index = FindByName(group.name, user.groups);
			if(index != null) {

				var m = "A group with the name " + group.name + " exists under the user " + username;
				console.log("5: " + m);
				if(callback != null) {
					callback({err: 5, msg: m});
				}

			} else {

				user.groups.push(group);
				user.save(function(err) {

					if(err != null) {

						var m = "Error saving the user back with new group: " + err;
						console.log("6: " + m);
						if(callback != null) {
							callback({err: 6, msg: m});
						}

					} else {
						if(callback != null) {
							callback(group);
						}
					}

				});

			}

		}

	});

}

exports.ChangeGroup = function(username, group, callback) {

	QueryUserAndExecute(username, function(user) {

		if(user.err != null) {

			var m = "User " + username + " was not found";
			console.log("10: " + m);
			if(callback != null) {
				callback({err: 10, msg: m});
			}

		} else {

			var index = FindByName(group.name, user.groups);
			if(index == null) {

				var m = "Could not find group in user " + username;
				console.log("11: " + m);
				if(callback != null) {
					callback({err: 11, msg: m});
				}

			} else {

				if(group.name != null) {
					user.groups[index].name = group.name;
				}
				if(group.contacts != null) {
					user.groups[index] = group.contacts;
				}
				if(group.frequency != null) {
					user.groups[index] = group.frequency;
				}
				if(group.frequencyType != null) {
					user.groups[index] = group.frequencyType;
				}
				if(group.lastReset != null) {
					user.groups[index] = group.lastReset;
				}

				user.save(function(err) {

					if(err != null) {

						var m = "Error saving the user back with new group info: " + err;
						console.log("12: " + m);
						if(callback != null) {
							callback({err: 12, msg: m});
						}

					} else {
						callback(user.groups[index]);
					}

				});

			}

		}

	});

}

exports.RemoveGroup = function(username, group, callback) {

	QueryUserAndExecute(username, function(user) {

		if(user.err != null) {
			if(callback != null) {
				callback(user);
			}
		} else {

			var index = FindByName(group.name, user.groups);
			if(index != null) {

				user.groups.splice(index, 1);
				user.save(function(err) {

					if(err != null) {

						var m = "Error saving the user back after group removal: " + err;
						console.log("13: " + m);
						if(callback != null) {
							callback({err: 13, msg: m});
						}

					} else {
						if(callback != null) {
							callback(user.groups[index]);
						}
					}

				});

			}

		}

	});

}

exports.AddContact = function(username, groupname, contact, callback) {

	QueryUserAndExecute(username, function(user) {

		if(user.err != null) {
			if(callback != null) {
				callback(user);
			}
		} else {

			var groupIndex = FindByName(groupname, user.groups);
			if(groupIndex == null) {

				var m = "Could not find group " + groupname + " on user " + user.phoneNumber;
				console.log("14: " + m);
				if(callback != null) {
					callback({err: 14, msg: m});
				}

			} else {

				var contactIndex = FindByNumber(contact.phoneNumber, user.contacts);
				if(contactIndex != null) {

					var m = "A contact with the number " + contact.phoneNumber + " already exists";

				}

				contact.communications = {calls:{count:0, missed:false}, sms:{count:0, missed:false}, whatsapp:{count:0, missed:false}};
				user.groups[groupIndex].push(contact);
				user.save(function(err) {

					if(err != null) {

						var m = "Error saving the user back after contact addition: " + err;
						console.log("15: " + m);
						if(callback != null) {
							callback({err: 15, msg: m});
						}

					} else {
						if(callback != null) {
							callback(contact);
						}
					}

				});

			}
		}

	});

}

exports.ChangeContact = function(username, groupname, contact, callback) {

	QueryUserAndExecute(username, function(user) {

		if(user.err != null) {
			if(callback != null) {
				callback(user);
			}
		} else {

			var groupIndex = FindByName(groupname, user.group);
			if(groupIndex == null) {

			}

		}

	});

}



// Helper functions
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array) {
        return false;
    }

    // compare lengths - can save a lot of time 
    if (this.length != array.length) {
        return false;
    }

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i])) {
                return false;       
            }
        } else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}   