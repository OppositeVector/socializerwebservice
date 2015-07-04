var session = require("express-session");
var mongoStore = require('connect-mongo')(session);
var url = require('url');

exports = module.exports = controller;

if(!String.prototype.startsWith){
    String.prototype.startsWith = function (str) {
        return !this.indexOf(str);
    }
}

var app;
var dbController;

function controller(express, mongoose) {

	app = express;
	dbController = mongoose;

	var s = process.env.SESSION_SECRET || 'For production';

	app.use(session({
		secret: s,
		resave: false,
		saveUninitialized: true,
		store: new mongoStore({mongooseConnection: dbController.connection}),
		cookie: { maxAge: 60000 }
	}));

	app.use(function(req, res, next) {

		if(req.session.counter == null) {
			req.session.counter = 0;
		} else {
			++req.session.counter;
		}

		if(req.session.user == null) {

			var number;
			var key;

			if(req.body != null) {
				number = req.body.pn;
				key = req.body.key;
			} else {
				var urlPart = url.parse(req.url,true);
				number = urlPart.query.pn;
				key = urlPart.query.key;
			}

			if((number != null) && (key != null)) {
				dbController.GetUser(number,function(userData){
					if(userData.err != null) {
						SendJson({result: 0, data: userData}, res);
					} else {
						if(userData.key==key){
							req.session.user = userData;
							console.log("Session created");
							next();
						}else{
							SendJson({ result:0, data:"Session creation failed" },res);
							console.log("Authentication failure");
						}
					}
				});
			} else{
				SendJson({result: 0, data:"Missing parameters for session creation"}, res);
			}

		} else {
			next();
		}

	});

	console.log("Session store ready with secret " + s);

}