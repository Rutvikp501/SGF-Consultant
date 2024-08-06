const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const middleware = require("../middleware/index.js");
const User = require("../models/user.models.js");
const LeadModel = require("../models/lead.models.js");
const { calculateCycle, calculateLeadCycle, generateLeadID } = require("../helpers/sample.js");


router.get("/admin/dashboard", middleware.ensureAdminLoggedIn, async (req,res) => {
	const numAdmins = await User.countDocuments({ role: "admin" });
	const numAgents = await User.countDocuments({ role: "consultant" });
	const numPendingLeads = await LeadModel.countDocuments({ status: "Pending" });
	const numConvertedLeads = await LeadModel.countDocuments({ status: "Converted" });
	const numJunkLeads = await LeadModel.countDocuments({ status: "Junk" });
	res.render("admin/dashboard", {
		title: "Dashboard",
		numAdmins, numAgents, numPendingLeads, numConvertedLeads, numJunkLeads,	});
});

router.get("/admin/Leads/pending", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const pendingLeads = await LeadModel.find().populate("consultant");
		
		res.render("admin/pendingLeads", { title: "Pending Leads", pendingLeads });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/Leads/previous", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const previousLeads = await LeadModel.find({ status: "collected" }).populate("donor");
		res.render("admin/previousLeads", { title: "Previous Leads", previousLeads });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/Leads/view/:LeadsId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const LeadsId = req.params.LeadsId;
		const Leads = await LeadModel.findById(LeadsId).populate("consultant");
		// console.log(Leads);
		
		res.render("admin/leads", { title: "Leads details", Leads });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/Leads/accept/:LeadsId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const LeadsId = req.params.LeadsId;
		await LeadModel.findByIdAndUpdate(LeadsId, { status: "accepted" });
		req.flash("success", "Leads accepted successfully");
		res.redirect(`/admin/Leads/view/${LeadsId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/Leads/reject/:LeadsId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const LeadsId = req.params.LeadsId;
		await LeadModel.findByIdAndUpdate(LeadsId, { status: "rejected" });
		req.flash("success", "Leads rejected successfully");
		res.redirect(`/admin/Leads/view/${LeadsId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/Leads/assign/:LeadsId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const LeadsId = req.params.LeadsId;
		const agents = await User.find({ role: "agent" });
		const Leads = await LeadModel.findById(LeadsId).populate("donor");
		res.render("admin/assignAgent", { title: "Assign agent", Leads, agents });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.post("/admin/Leads/assign/:LeadsId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const LeadsId = req.params.LeadsId;
		const {agent, adminToAgentMsg} = req.body;
		await LeadModel.findByIdAndUpdate(LeadsId, { status: "assigned", agent, adminToAgentMsg });
		req.flash("success", "Agent assigned successfully");
		res.redirect(`/admin/Leads/view/${LeadsId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/agents", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const consultant = await User.find({ role: "consultant" });
		// console.log(consultant);
		
		res.render("admin/Consultants", { title: "List of consultant", consultant });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
router.get("/admin/addConsultant", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const agents = await User.find({ role: "agent" });
		res.render("admin/addConsultant", { title: "List of agents", agents });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
	
});
router.post("/admin/addConsultant", middleware.ensureAdminLoggedIn, async (req,res) => {
	
	
	const {   email_id, password1, role, User_code, User_name, mobile_no, dateOfJoining, isAdmin } = req.body;
	let errors = [];
	
	// Validate input fields
	if ( !email_id || !password1 || !User_code || !User_name || !mobile_no || !dateOfJoining) {
		errors.push({ msg: "Please fill in all the fields" });
	}
	
	if (password1.length < 4) {
		errors.push({ msg: "Password length should be at least 4 characters" });
	}
	
	if (errors.length > 0) {
		return res.render("/admin/addConsultant", {
			title: "addConsultant",
			errors,  email_id, password1, User_code, User_name, mobile_no, dateOfJoining, isAdmin
		});
	}
	
	try {
		// Check for existing email and user code
		const getExistingUser = await User.findOne({ email_id: email_id });
		const duplicateCode = await User.findOne({ code: User_code });
	
		if (getExistingUser) {
			errors.push({ msg: "This Email is already registered. Please try another email." });
			return res.render("/admin/addConsultant", {
				title: "addConsultant",
				errors,  email_id, password1, User_code, User_name, mobile_no, dateOfJoining, isAdmin
			});
		}
	
		if (duplicateCode) {
			return res.status(400).send({ success: "failed", message: "Consultant code already exists." });
		}
	
		// Encrypt the password
		const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password1, salt);
	
		// Calculate cycle
		const date = new Date(dateOfJoining); // Parse date string
		const { cycleLabel, cycleNumber } = calculateCycle(date);
	
		// Create new user
		const newUser = new User({
			code: User_code,
			name: User_name,
			email_id: email_id,
			mobile_no: mobile_no,
			role: role,
			password: hash,
			dateOfJoining: date,
			currentcycle: { label: cycleLabel, number: cycleNumber }
		});
	
		// console.log(newUser);
		await newUser.save();
	
		req.flash("success", "Consultant  successfully added ");
		res.redirect("/admin/agents");
	
	} catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.");
		res.redirect("back");
	}
	
	
});

router.get("/admin/profile", middleware.ensureAdminLoggedIn, (req,res) => {
	res.render("admin/profile", { title: "My profile" });
});

router.put("/admin/profile", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const id = req.user._id;
		const updateObj = req.body.admin;	// updateObj: {name, lastName, gender, address, phone}
		await User.findByIdAndUpdate(id, updateObj);
		
		req.flash("success", "Profile updated successfully");
		res.redirect("/admin/profile");
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});

router.get("/admin/addLeads", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const Leads = await LeadModel.find({ role: "agent" });
		res.render("admin/addLeads", { title: "List of Leads", Leads });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
	
});
router.post("/admin/addLeads",  async (req,res) => { //middleware.ensureAdminLoggedIn,
	
	const { Adviser, name, email, phone, eventName, eventDate, eventLocation, pincode, eventSpecialsName, specialCode, leadType, status } = req.body;
  
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
		if (duplicatecode) {
			errors.push({ msg: "." });
			return res.render("/admin/addLeads", {
				title: "Leads",
				errors,  Adviser, name, email, phone, eventName, eventDate, eventLocation, pincode, eventSpecialsName, specialCode, leadType, status,
			});
		}

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
		
        await newlead.save();
 		req.flash("success", "Lead  successfully added ");
		res.redirect("/admin/Leads/pending");
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
});
module.exports = router;