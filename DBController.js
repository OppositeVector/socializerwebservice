var mongoose = require('mongoose');
var user = require('./schemas/userSchema');

var uri = process.env.MONGOLAB_URI || "mongodb://WebDevUser:webdevuser@ds061188.mongolab.com:61188/socializerdev";
var dbUser = process.env.DB_USER || "WebDevUser";
var dbPass = process.env.DB_PASSWORD || "webdevuser";
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

con.once('open',function(err){

	if(err!=null){
		console.log(err);
	}else{
		if(uri == process.env.MONGOLAB_URI) {
			console.log('Successfully opened production db connection');
		} else {
			console.log('Successfully opened db connection to dev: ' + uri + " \noptions: \n" + JSON.stringify(options, null, 4));
		}
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
			console.log(errors.userNotFound(phone));
			dependency(errors.userNotFound(phone));
		} else {
			dependency(user);
		}

	});

}

function TryFindUser(phone, dependency) {

	userModel.findOne().where("phoneNumber").equals(phone).exec(function(err, doc) {

		if(err != null) {
			console.log(errors.dbError(phone, err));
			dependency(errors.dbError(phone, err));
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

					console.log(errors.userCreation(err));
					if(callback != null) {
						callback(errors.userCreation(err));
					}

				}

			});

		} else {

			if(user.result != null) {
				if(callback != null) {
					callback(user);
				}
			} else {
				console.log(errors.userExists(userObj.phoneNumber));
				if(callback != null) {
					callback(errors.userExists(userObj.phoneNumber));
				}

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

			console.log(errors.userUpdate(err));
			if(callback != null) {
				callback(errors.userUpdate(err));
			}

		} else {
			if(callback != null) {
				callback(user);
			}
		}

	});

}