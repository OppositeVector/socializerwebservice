var mongoose = require('mongoose');
var schema = mongoose.Schema;

var group = new schema({
	name:String,
	contacts:[String],
	frequency:{
		calls:Number,
		whatsapp:Number,
		sms:Number
	},
	frequencyType:Number,
	lastReset:Date

},{collection:'groups'});
exports.groupSchema = group;