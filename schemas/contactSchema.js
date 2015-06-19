var mongoose = require('mongoose');
var schema = mongoose.Schema;

var contact = new schema({
	name:String,
	phoneNumber:String,
	groupId:String,
	communications:{
		calls:{
			count:Number,
			missed:Boolean
		},
		whatsapp:{
			count:Number,
			missed:Boolean
		},
		sms:{
			count:Number,
			missed:Boolean
		}
	}

},{collection:'contacts'});
exports.contactSchema = contact;