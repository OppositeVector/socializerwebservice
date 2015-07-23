var mongoose = require('mongoose');
var schemaBase = mongoose.Schema;

var user = new schemaBase({
	phoneNumber:String,
	key:String,
	groups: [{
		name:String,
		contacts:[{
			id:String,
			displayName:String,
			phoneNumber:[String],
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
		lastReset:Date,
		reminder:Boolean,
		missedCallSnoozer:Boolean
	}]
},{collection: "users"});

exports.userSchema = user;