const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const LeadModel = require("../models/lead.models.js");
const { calculateLeadCycle, generateLeadID, calculateCycle } = require("../helpers/sample.js");

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
		const AllLeads = await LeadModel.find().populate("consultant");
		res.render("consultant/allleads", { title: "All Leads", AllLeads });
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
		res.render("consultant/leads", { title: "Leads details", Leads });
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
router.post("/consultant/addLeads",  async (req,res) => { //middleware.ensureAdminLoggedIn,
	
	const { Adviser, name, email, phone, eventName, eventDate, eventLocation, pincode, eventSpecialsName, specialCode, leadType, status } = req.body;
// 	console.log(req.body);
	
//   return req.body;
    try {
		
		const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const { cycleLabel, cycleNumber } = calculateCycle(currentDate);
        const consultantDetails = await User.find({ code: Adviser });
		
		
        if (!consultantDetails[0]) {
			return res.status(404).send({ message: 'Consultant not found' });
        }
        const leadcycle = calculateLeadCycle(leadType, currentDate)
        let leadNumber = 1;
        let cycleKey = `${currentYear}-${leadcycle.Label}`;
		
        if (leadType === 'Seasonal') {
			leadNumber = (consultantDetails[0].leadsPerCycle.seasonal.get(cycleKey) || 0) + 1;
            consultantDetails[0].leadsPerCycle.seasonal.set(cycleKey, leadNumber);
        } else {
			leadNumber = (consultantDetails[0].leadsPerCycle.regular.get(cycleKey) || 0) + 1;
            consultantDetails[0].leadsPerCycle.regular.set(cycleKey, leadNumber);
        }	
        const leadID = generateLeadID(consultantDetails[0].code, leadType, leadcycle.Label, consultantDetails[0].consultantLifetimeCycleNumber, leadNumber, pincode);
        const duplicatecode = await LeadModel.find({ leadIDd: leadID }); 
		console.log(duplicatecode);
		if (duplicatecode) {
			errors.push({ msg: ".duplicatecode" });
			return res.render("consultant/addLeads", {
				title: "Leads",
				errors,  Adviser, name, email, phone, eventName, eventDate, eventLocation, pincode, eventSpecialsName, specialCode, leadType, status,
			});
		}
		console.log("test1");
        await consultantDetails[0].save();

        const newlead = new LeadModel({
            consultant: consultantDetails[0]._id,
            consultant_code: consultantDetails[0].code,
            name: name,
            email: email,
            phone: phone,
            eventName: eventName,
            eventDate: eventDate,
            eventLocation: eventLocation,
            pincode: pincode,
            eventSpecialsName: eventSpecialsName,
            specialCode: specialCode,
            leadType: leadType,
            status: status,
            leadID: leadID,
            cycle: { label: leadcycle.Label, number: leadcycle.Number,year:leadcycle.year }
        });
		// console.log(newlead);
		console.log("test2");
        await newlead.save();
 		req.flash("success", "Lead  successfully added ");
		res.redirect("/admin/Leads/pending");
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});

module.exports = router;