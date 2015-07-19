var mongoose = require('mongoose');
var user = require('./schemas/userSchema');

var dotenv = require("dotenv")
dotenv.config({silent: true})
dotenv.load();

var options = {
	server: { },
	replset: { },
	user: process.env.DB_USER,
	pass: process.env.DB_PASSWORD
}
options.server.socketOptions = options.replset.socketOptions = { keepAlive: 1 };

mongoose.connect(process.env.MONGOLAB_URI, options);

var con = module.exports.connection = mongoose.connection;
var userModel = mongoose.model('userM',user.userSchema);

con.once('open',function(err){

	if(err!=null){
		console.log(err);
	}else{
		console.log('Successfully opened production db connection');
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

exports.UpdateUser = function(userObj, callback) {

	QueryUserAndExecute(userObj.phoneNumber, function(user) {

		user.groups = userObj.groups;
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
	});
	

}