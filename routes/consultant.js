const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.js");
const LeadModel = require("../models/lead.models.js");

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

router.get("/consultant/Leads/pending", middleware.ensureconsultantLoggedIn, async (req,res) => {
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


router.get("/consultant/Leads/previous", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const ConvertedLeads = await LeadModel.find({ consultant: req.user._id, status: "Converted" }).populate("consultant");
		res.render("consultant/previousLeads", { title: "Previous Leads", ConvertedLeads });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/consultant/leads/view/:collectionId", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const collectionId = req.params.collectionId;
		const collection = await LeadModel.findById(collectionId).populate("consultant");
		res.render("consultant/collection", { title: "Collection details", collection });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/consultant/collection/collect/:collectionId", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const collectionId = req.params.collectionId;
		await LeadModel.findByIdAndUpdate(collectionId, { status: "collected", collectionTime: Date.now() });
		req.flash("success", "Donation collected successfully");
		res.redirect(`/consultant/leads/view/${collectionId}`);
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

module.exports = router;