const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
	name: { type: String, required: true },
	mobile_no: { type: Number },
	email_id: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, required: true },
	department: { type: String, required: true },
	pincode: { type: String,default: null  },
	city: { type: String,default: null  },
	otp: { type: String, default: null },
	otpExpires: { type: Date, default: null },
	status: { type: String, default: "Active" }
}, { timestamps: true });


const adminModel = mongoose.model("admins", adminSchema);
module.exports = adminModel;

