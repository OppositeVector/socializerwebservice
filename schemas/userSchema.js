var mongoose = require('mongoose');
var schemaBase = mongoose.Schema;

var user = new schemaBase({
	phoneNumber:String,
	key:String,
	groups: [{
		name:String,
		contacts:[{
			name:String,
			phoneNumber:String,
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
		}],
		frequency:{
			frequencyType:Number,
			calls:Number,
			whatsapp:Number,
			sms:Number
		},
		lastReset:Date
	}]
},{collection: "users"});

exports.userSchema = user;