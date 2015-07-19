var session = require("express-session");
var mongoStore = require('connect-mongo')(session);
var url = require('url');
var errors = require("./Errors");

var dotenv = require("dotenv")
dotenv.config({silent: true})
dotenv.load();

exports = module.exports = controller;

var app;
var dbController;
var actions;

function controller(express, mongoose, act, nonSessioned, sessioned, authenticated) {

	app = express;
	dbController = mongoose;
	actions = act;

	app.use(function(req, res, next) {
	  	res.header("Access-Control-Allow-Origin", "*");
	 	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	 	next();
	});

	app.use(function(req, res, next) {
		if(req != null) {
			if(req.headers != null) {
				console.log(JSON.stringify(req.headers));
			}
			if(req.body != null) {
				console.log(JSON.stringify(req.body));
			}
		}
		next();
	});

	nonSessioned();

	console.log("basic session");
	app.use(session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		store: new mongoStore({mongooseConnection: dbController.connection}),
		cookie: { maxAge: 60000 * 5 }
	}));

	sessioned();

	console.log("authenticated check");
	app.use(function(req, res, next) {

		if(req.session.counter == null) {
			req.session.counter = 0;
		} else {
			++req.session.counter;
		}

		if(req.session.user == null) {

			// var number;
			// var key;

			// if(req.body != null) {
			// 	number = req.body.pn;
			// 	key = req.body.key;
			// } else {
			// 	var urlPart = url.parse(req.url,true);
			// 	number = urlPart.query.pn;
			// 	key = urlPart.query.key;
			// }

			// if((number != null) && (key != null)) {
			// 	dbController.GetUser(number,function(userData){
			// 		if(userData.result != null) {
			// 			actions.SendJson(userData, res);
			// 		} else {
			// 			if(userData.key==key){
			// 				req.session.user = userData;
			// 				next();
			// 			}else{
			// 				actions.SendJson(errors.sessionFailed(req.session.user.phoneNumber), res);
			// 			}
			// 		}
			// 	});
			// } else{
			// 	actions.SendJson(errors.missingParameter("session creation"), res);
			// }

			actions.SendJson(errors.sessionFailed(), res);

		} else {
			next();
		}

	});

	authenticated();

	console.log("Session store ready");

}