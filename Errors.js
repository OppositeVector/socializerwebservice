// General purpose errors
exports.missingParameter = function(action) {
	var m = "Missing parameters on " + action;
	console.log(m);
	return {result: -1, data: m};
}

// SessionConotrller.js errors
exports.sessionFailed = function(user) {
	var m = "Session not created or expired";
	console.log(m + " on user " + user);
	return {result: -10, data: m};
} 

// DBController.js errors
exports.dbError = function(user, err) {
	var m = "Querying user " + user + " returned an error -- " + err;
	console.log(m)
	return {result: -20, data: m};
}
exports.userNotFound = function(user) {
	var m = "User " + user + " was not found";
	console.log(m);
	return {result: -21, data: m};
}
exports.userCreation = function(err) {
	var m = "Error creating user -- " + err
	console.log(m);
	return {result: -22, data: m};
}
exports.userExists = function(user) {
	var m = "User " + user + " already exists";
	console.log(m);
	return {result: -24, data: m};
}
exports.userUpdate = function(err) {
	var m = "Could not update user, error: " + err;
	console.log(m);
	return {result: -25, data: m};
}

// Actions.js errors
exports.groupExists = function() {
	var m = "Group already exists";
	console.log(m);
	return {result: -30, data: m};
} 
exports.groupNotFound = function() {
	var m = "Group not found";
	console.log(m);
	return {result: -31, data: m};
} 