const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const LeadModel = require("../models/lead.models.js");
const { calculateLeadCycle, generateLeadID, calculateCycle } = require("../helpers/common.js");
const { addLead } = require("../utility/bitrix.js");

router.get("/consultant/dashboard", middleware.ensureconsultantLoggedIn, async (req,res) => {
	const consultantId = req.user._id;
	const numPendingLeads = await LeadModel.countDocuments({ consultant: consultantId, status: "Pending" });
	const numAllLeads = await LeadModel.countDocuments({ consultant: consultantId, });
	const numConvertedLeads = await LeadModel.countDocuments({ consultant: consultantId, status: "Converted" });
	const numJunkLeads = await LeadModel.countDocuments({ consultant: consultantId, status: "Junk" });
	res.render("consultant/dashboard", {
		title: "Dashboard",
		numAllLeads,numPendingLeads,numConvertedLeads,numJunkLeads
	});
});

router.get("/consultant/leads/pending", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const pendingLeads = await LeadModel.find({ consultant: req.user._id, status: "Pending" }).populate("consultant");
		res.render("consultant/pendingLeads", { title: "Pending Leads", pendingLeads });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});

router.get("/consultant/leads/all", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const AllLeads = await LeadModel.find({ consultant: req.user._id,}).populate("consultant");
		res.render("consultant/allleads", { title: "All Leads",allLeads: AllLeads });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});
router.get("/consultant/leads/converted", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const ConvertedLeads = await LeadModel.find({ consultant: req.user._id, status: "Converted" }).populate("consultant");
		res.render("consultant/convertedLeads", { title: "Previous Leads", ConvertedLeads });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/consultant/leads/view/:leadId", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const leadId = req.params.leadId;
		const Leads = await LeadModel.findById(leadId).populate("consultant");
		res.render("consultant/leads", { title: "Leads details", Leads: Leads, });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/consultant/lead/leads/:leadId", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const leadId = req.params.leadId;
		await LeadModel.findByIdAndUpdate(leadId, { status: "collected", leadTime: Date.now() });
		req.flash("success", "Donation collected successfully");
		res.redirect(`/consultant/leads/view/${leadId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});



router.get("/consultant/profile", middleware.ensureconsultantLoggedIn, (req,res) => {
	res.render("consultant/profile", { title: "My Profile" });
});

router.put("/consultant/profile", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.consultant;	// updateObj: {name, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/consultant/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});

router.get("/consultant/profile/google-maps", middleware.ensureconsultantLoggedIn, (req, res) => {
    res.render("consultant/googleMaps", { title: "Google Maps" });
});

router.get("/consultant/addLeads", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const Leads = await LeadModel.find({ role: "consultant" });
		res.render("consultant/addLeads", { title: "List of Leads", Leads });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
	
});

router.post("/consultant/addLeads", middleware.ensureconsultantLoggedIn, async (req,res) => { //middleware.ensureAdminLoggedIn,
	
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
		if (duplicatecode) {
			errors.push({ msg: ".duplicatecode" });
			return res.render("consultant/addLeads", {
				title: "Leads",
				errors,});
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
 		req.flash("success", "Lead  successfully added ");
		res.redirect("/consultant/Leads/all");
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;