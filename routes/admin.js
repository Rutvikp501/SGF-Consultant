const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const middleware = require("../middleware/index.js");
const UserModel = require("../models/user.js");
const LeadModel = require("../models/lead.models.js");
const ConvertedLeadModel = require("../models/convertedLead.model.js");
const JunkLeadModel = require("../models/junkLead.model.js");
const { calculateCycle, } = require("../helpers/sample.js");

const { Consultant_Wellcome } = require("../utility/email.util.js");
const { addLead } = require("../controllers/lead.controller.js");
const packagesModel = require("../models/packages.model.js");


router.get("/admin/dashboard", middleware.ensureAdminLoggedIn, async (req, res) => {
	const numAdmins = await UserModel.countDocuments({ role: "admin" });
	const numAgents = await UserModel.countDocuments({ role: "consultant" });
	const numPendingLeads = await LeadModel.countDocuments({ status: "Pending" });
	const numConvertedLeads = await LeadModel.countDocuments({ status: "Converted" });
	const numJunkLeads = await LeadModel.countDocuments({ status: "Junk" });
	res.render("admin/dashboard", {
		title: "Dashboard",
		numAdmins, numAgents, numPendingLeads, numConvertedLeads, numJunkLeads,
	});
});

router.get("/admin/Leads/all", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const { search, sortBy, order = 'asc' } = req.query; // Get query parameters

		// Build the query object
		let query = {};
		if (search) {
			query = {
				$or: [
					{ leadID: new RegExp(search, 'i') },
					{ consultant_code: new RegExp(search, 'i') },
					{ leadType: new RegExp(search, 'i') },
					{ status: new RegExp(search, 'i') }
				]
			};
		}

		// Fetch the leads with the search and sort criteria
		const allLeads = await LeadModel.find(query)
			.populate("consultant")
			.sort({ [sortBy]: order === 'asc' ? 1 : -1 });

		res.render("admin/allLeads", { title: "Pending Leads", allLeads, search, sortBy, order });
	} catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.");
		res.redirect("back");
	}
});

router.get("/admin/Leads/converted", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const ConvertedLeads = await LeadModel.find({ status: "Converted" }).populate("consultant");

		res.render("admin/convertedLeads", { title: "Converted Leads ", ConvertedLeads });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/Leads/view/:LeadsId", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const LeadsId = req.params.LeadsId;
		const Leads = await LeadModel.findById(LeadsId).populate("consultant");
		const ConvertedLeads = await ConvertedLeadModel.find({ leadID: Leads.leadID });

		res.render("admin/leads", { title: "Leads details", Leads: Leads, ConvertedLeads: ConvertedLeads });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.post("/admin/Leads/converte/:LeadsId", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const LeadsId = req.params.LeadsId;
		const lead = await LeadModel.findById(LeadsId);


		// Create a new converted lead with additional package details
		const newConvertedLead = new ConvertedLeadModel({
			consultant: req.user._id,
			consultant_code: lead.consultant_code,
			leadID: lead.leadID,
			name: lead.name,
			email: lead.email,
			phone: lead.phone,
			eventName: lead.eventName,
			eventDate: lead.eventDate,
			eventLocation: lead.eventLocation,
			pincode: lead.pincode,
			eventSpecialsName: lead.eventSpecialsName || '',
			specialCode: lead.specialCode || '',
			leadType: lead.leadType,
			status: "Converted",
			cycle: lead.cycle,
			packages: {
				name: req.body.packageName || '', // Optional
				subname: req.body.packageSubname || '', // Optional
				addonS: req.body.packageAddons ? req.body.packageAddons.split(',').map(addon => addon.trim()) : [], // Optional
				amount: req.body.packageAmount || 0, // Optional
			},
			conversionDate: new Date(),
		});

		await newConvertedLead.save();
		await LeadModel.findByIdAndUpdate(LeadsId, { status: "Converted" });
		req.flash("success", "Lead converted and saved successfully");
		res.redirect(`/admin/Leads/view/${LeadsId}`);
	} catch (err) {
		console.log(err);
		req.flash("error", "An error occurred while converting the lead.");
		res.redirect("back");
	}
});

router.post("/admin/Leads/reject/:LeadsId", middleware.ensureAdminLoggedIn, async (req, res) => {
	//console.log(req.params,req.body);

	try {
		const LeadsId = req.params.LeadsId;
		const { rejectionMark } = req.body;
		const lead = await LeadModel.findById(LeadsId);

		const junkLead = new JunkLeadModel({
			consultant: lead.consultant,
			consultant_code: lead.consultant_code,
			leadID: lead.leadID,
			name: lead.name,
			email: lead.email,
			phone: lead.phone,
			eventName: lead.eventName,
			eventDate: lead.eventDate,
			eventLocation: lead.eventLocation,
			pincode: lead.pincode,
			eventSpecialsName: lead.eventSpecialsName,
			specialCode: lead.specialCode,
			leadType: lead.leadType,
			cycle: lead.cycle,
			rejectionMark: rejectionMark,
			rejectionDate: new Date(),
		});

		await junkLead.save();
		//await LeadModel.findByIdAndDelete(LeadsId);
		await LeadModel.findByIdAndUpdate(LeadsId, { status: "rejected" });
		req.flash("success", "Leads rejected successfully");
		res.redirect(`/admin/Leads/view/${LeadsId}`);
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}

});

router.get("/admin/consultants", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const consultant = await UserModel.find({ role: "consultant" });
		const admin = await UserModel.find({ role: "admin" });
		// console.log(consultant);

		res.render("admin/Consultants", { title: "List of consultant", consultant });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/admins", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const admin = await UserModel.find({ role: "admin" });
		//console.log(admin);

		res.render("admin/admins", { title: "List of Admin", admin });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/addUser", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const agents = await UserModel.find({ role: "agent" });
		res.render("admin/addUser", { title: "List of agents", agents });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}


});

router.post("/admin/addUser", middleware.ensureAdminLoggedIn, async (req, res) => {


	const { email_id, password1, role, user_code, user_name, mobile_no, dateOfJoining, isAdmin, sales_assistan_name, sales_assistan_mobile_no, bank_name, account_number, ifsc_code, branch_name } = req.body;
	let errors = [];
	if (!email_id || !password1 || !user_code || !user_name || !mobile_no || !dateOfJoining) {
		errors.push({ msg: "Please fill in all the fields" });
	}

	if (password1.length < 4) {
		errors.push({ msg: "Password length should be at least 4 characters" });
	}
	if (!bank_name || !account_number || !ifsc_code || !branch_name) {
		errors.push({ msg: "Please fill in all bank details" });
	}
	if (errors.length > 0) {
		return res.render("/admin/addUser", {
			title: "addUser",
			errors, email_id, password1, user_code, user_name, mobile_no, dateOfJoining, isAdmin
		});
	}

	try {
		// Check for existing email and user code
		const getExistingUser = await UserModel.findOne({ email_id: email_id });
		const duplicateCode = await UserModel.findOne({ code: user_code });

		if (getExistingUser) {
			errors.push({ msg: "This Email is already registered. Please try another email." });
			return res.render("/admin/addUser", {
				title: "addUser",
				errors, email_id, password1, user_code, user_name, mobile_no, dateOfJoining, isAdmin
			});
		}

		if (duplicateCode) {
			return res.status(400).send({ success: "failed", message: "User code already exists." });
		}

		// Encrypt the password
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password1, salt);

		// Calculate cycle
		const date = new Date(dateOfJoining); // Parse date string
		const { cycleLabel, cycleNumber } = calculateCycle(date);

		// Create new user
		const newUser = new UserModel({
			code: user_code,
			name: user_name,
			email_id: email_id,
			mobile_no: mobile_no,
			role: role,
			password: hash,
			dateOfJoining: date,
			sales_assistan: {
				name: sales_assistan_name || null,
				mobile_no: sales_assistan_mobile_no || null,
			},
			user_bank_details: {
				bank_name: bank_name || null,
				account_number: account_number || null,
				ifsc_code: ifsc_code || null,
				branch_name: branch_name || null,
			},
			currentcycle: { label: cycleLabel, number: cycleNumber }
		});
		await newUser.save();
		await Consultant_Wellcome(newUser, password1); // wellcome mail 
		req.flash("success", "User  successfully added ");
		res.redirect("/admin/consultants");

	} catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.");
		res.redirect("back");
	}


});

router.get("/admin/profile", middleware.ensureAdminLoggedIn, (req, res) => {
	res.render("admin/profile", { title: "My profile" });
});

router.put("/admin/profile", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const id = req.user._id;
		const updateObj = req.body.admin;	// updateObj: {name, lastName, gender, address, phone}
		await UserModel.findByIdAndUpdate(id, updateObj);

		req.flash("success", "Profile updated successfully");
		res.redirect("/admin/profile");
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}

});

router.get("/admin/addLeads", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const Leads = await LeadModel.find();
		res.render("admin/addLeads", { title: "List of Leads", Leads });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}


});

router.post('/admin/addLeads', middleware.ensureAdminLoggedIn, async (req, res) => {
	let params = req.body;
	try {
		const currentDate = new Date();
		const currentYear = currentDate.getFullYear();
		const { cycleLabel, cycleNumber } = calculateCycle(currentDate);
		const consultantDetails = await User.findOne({ code: params.consultant });

		// Check if consultant exists
		if (!consultantDetails) {
			return res.status(404).send({ message: 'Consultant not found' });
		}
		consultantDetails.calculateLifetimeCycleNumber();
		const leadcycle = calculateLeadCycle(params.leadType, currentDate)
		let leadNumber = 1;
		let cycleKey = `${currentYear}-${leadcycle.Label}`;

		if (params.leadType === 'Seasonal') {
			leadNumber = (consultantDetails.leadsPerCycle.seasonal.get(cycleKey) || 0) + 1;
			consultantDetails.leadsPerCycle.seasonal.set(cycleKey, leadNumber);
		} else {
			leadNumber = (consultantDetails.leadsPerCycle.regular.get(cycleKey) || 0) + 1;
			consultantDetails.leadsPerCycle.regular.set(cycleKey, leadNumber);
		}
		const leadID = generateLeadID(consultantDetails.code, params.leadType, leadcycle.Label, consultantDetails.consultantLifetimeCycleNumber, leadNumber, params.pincode);
		const duplicatecode = await LeadModel.find({ leadIDd: leadID });
		if (duplicatecode != "") {
			return res.send({
				success: false,
				statusCode: 400,
				message: "leadID already exist."
			});
		}
		await consultantDetails.save();
		const formattedEvents = params.events.map(event => ({
			name: event.name || 'Unnamed Event',
			date: new Date(event.date), // Ensure date is a Date object
			timing: event.timing || 'Not specified',
		}));
		const packageData = {
			name: params.package.packageName || 'NA',
			subname: params.package.subname || 'NA',
			addonS: params.package.addOns ? params.package.addOns.split(',').map(item => item.trim()) : [],
			amount: parseFloat(params.package.amount) || 0
		}
		const LeadData = {
			consultant: consultantDetails._id,
			consultant_code: consultantDetails.code,
			consultant_mobile_no: consultantDetails.mobile_no,
			consultant_email_id: consultantDetails.email_id,
			name: params.name,
			email: params.email,
			phone: params.phone,
			events: formattedEvents,
			eventLocation: params.eventLocation,
			pincode: params.pincode,
			eventSpecialsName: params.eventSpecialsName,
			specialCode: params.specialCode,
			leadType: params.leadType,
			status: params.status,
			leadID: leadID,
			cycle: { label: leadcycle.Label, number: leadcycle.Number, year: leadcycle.year },
			package: packageData
		};
		let bitrixres = await addLead(LeadData)

		const lead = new LeadModel({
			...LeadData,
			bitrixres: {
				status: bitrixres.status || '',
				message: bitrixres.message || ''
			}
		});

		//console.log(lead);

		await lead.save();

		req.flash("success", "Lead successfully added");
		res.redirect("/admin/Leads/all");
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Internal server error' });
	}
});

router.get("/admin/addpackages", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const packages = await packagesModel.find();
		res.render("admin/addPackage", { title: "List of Packages", Leads });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}


});

router.post('/admin/addLeads', middleware.ensureAdminLoggedIn, async (req, res) => {
	let params = req.body;
	console.log(params);

	try {

	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Internal server error' });
	}
});


module.exports = router;