const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
	code: { type: String, default: null },
	name: { type: String, required: true },
	mobile_no: { type: Number },
	email_id: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, required: true },
	pincode: { type: String,default: null  },
	city: { type: String,default: null  },
	profilePhotoUrl: { type: String, default: null },
	dateOfJoining: { type: Date },
	subscriptionDate: { type: Date, default: new Date() },
	subscriptionExpireDate: { type: Date ,default: new Date() },
	currentcycle: {
		regular: {
			cycleLabel: { type: String },
			cycleNumber: { type: Number },
			year: { type: Number }
		},
		seasonal: {
			cycleLabel: { type: String },
			cycleNumber: { type: Number },
			year: { type: Number }
		}
	},
	consultantLifetimeCycleNumber: { type: Number },
	leadsPerCycle: { 
		seasonal: { type: Map, of: Number, default: new Map() },
		regular: { type: Map, of: Number, default: new Map() }
	},
	convertedLeadsPerCycle: {
		seasonal: { type: Map, of: Number, default: new Map() },
		regular: { type: Map, of: Number, default: new Map() }
	},
	lastCommissionPercentage: {
		seasonal: { type: Number, default: 2 }, 
		regular: { type: Number, default: 4 }   
	},
	sales_assistan: { 
		name: { type: String, default: null },
		mobile_no: { type: Number, default: null },
	},
	user_bank_details: {
		bank_name: { type: String, default: null },
		account_number: { type: String, default: null },
		ifsc_code: { type: String, default: null },
		branch_name: { type: String, default: null },
	},
	aadhaarPhotoUrl: { type: String, default: null },  // Aadhaar photo URL
	panPhotoUrl: { type: String, default: null },      // PAN photo URL
	otp: { type: String, default: null },
	otpExpires: { type: Date, default: null },
	status: { type: String, default: "Active" }
}, { timestamps: true });

// Pre-save middleware to update subscriptionExpireDate based on subscriptionDate
userSchema.pre('save', function(next) {
	// Recalculate lifetime cycle number
	this.calculateLifetimeCycleNumber();
	
	// Automatically update the subscriptionExpireDate when subscriptionDate changes
	if (this.isModified('subscriptionDate')) {
		const oneYearLater = new Date(this.subscriptionDate);
		oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
		this.subscriptionExpireDate = oneYearLater;
	}

	next();
});

userSchema.methods.calculateLifetimeCycleNumber = function() {
	const dateOfJoining = this.dateOfJoining;
	const currentDate = new Date();
	const diffTime = Math.abs(currentDate - dateOfJoining);
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	this.consultantLifetimeCycleNumber = Math.ceil(diffDays / 60);
};

const User = mongoose.model("users", userSchema);
module.exports = User;

