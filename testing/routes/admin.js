const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const Donation = require("../models/donation.js");
const { calculateCycle } = require("../helpers/sample.js");


router.get("/admin/dashboard", middleware.ensureAdminLoggedIn, async (req,res) => {
	const numAdmins = await User.countDocuments({ role: "admin" });
	const numDonors = await User.countDocuments({ role: "donor" });
	const numAgents = await User.countDocuments({ role: "agent" });
	const numPendingDonations = await Donation.countDocuments({ status: "pending" });
	const numAcceptedDonations = await Donation.countDocuments({ status: "accepted" });
	const numAssignedDonations = await Donation.countDocuments({ status: "assigned" });
	const numCollectedDonations = await Donation.countDocuments({ status: "collected" });
	res.render("admin/dashboard", {
		title: "Dashboard",
		numAdmins, numDonors, numAgents, numPendingDonations, numAcceptedDonations, numAssignedDonations, numCollectedDonations
	});
});

router.get("/admin/donations/pending", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const pendingDonations = await Donation.find({status: ["pending", "accepted", "assigned"]}).populate("donor");
		res.render("admin/pendingDonations", { title: "Pending Donations", pendingDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donations/previous", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const previousDonations = await Donation.find({ status: "collected" }).populate("donor");
		res.render("admin/previousDonations", { title: "Previous Donations", previousDonations });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/view/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const donation = await Donation.findById(donationId).populate("donor").populate("agent");
		res.render("admin/donation", { title: "Donation details", donation });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/accept/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		await Donation.findByIdAndUpdate(donationId, { status: "accepted" });
		req.flash("success", "Donation accepted successfully");
		res.redirect(`/admin/donation/view/${donationId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/reject/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		await Donation.findByIdAndUpdate(donationId, { status: "rejected" });
		req.flash("success", "Donation rejected successfully");
		res.redirect(`/admin/donation/view/${donationId}`);
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/donation/assign/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const agents = await User.find({ role: "agent" });
		const donation = await Donation.findById(donationId).populate("donor");
		res.render("admin/assignAgent", { title: "Assign agent", donation, agents });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.post("/admin/donation/assign/:donationId", middleware.ensureAdminLoggedIn, async (req,res) => {
	try
	{
		const donationId = req.params.donationId;
		const {agent, adminToAgentMsg} = req.body;
		await Donation.findByIdAndUpdate(donationId, { status: "assigned", agent, adminToAgentMsg });
		req.flash("success", "Agent assigned successfully");
		res.redirect(`/admin/donation/view/${donationId}`);
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
		console.log(consultant);
		
		res.render("admin/agents", { title: "List of consultant", consultant });
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
	console.log(req.body);
	
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
	
		console.log(newUser);
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


module.exports = router;