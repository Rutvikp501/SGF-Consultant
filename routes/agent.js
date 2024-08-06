const express = require("express");
const router = express.Router();
const middleware = require("../middleware/index.js");
const User = require("../models/user.models.js");
const Donation = require("../models/donation.js");

router.get("/consultant/dashboard", middleware.ensureconsultantLoggedIn, async (req,res) => {
	const agentId = req.user._id;
	const numAssignedDonations = await Donation.countDocuments({ agent: agentId, status: "assigned" });
	const numCollectedDonations = await Donation.countDocuments({ agent: agentId, status: "collected" });
	res.render("consultant/dashboard", {
		title: "Dashboard",
		numAssignedDonations, numCollectedDonations
	});
});

router.get("/consultant/collections/pending", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const pendingCollections = await Donation.find({ agent: req.user._id, status: "assigned" }).populate("donor");
		res.render("consultant/pendingCollections", { title: "Pending Collections", pendingCollections });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
	
});


router.get("/consultant/collections/previous", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const previousCollections = await Donation.find({ agent: req.user._id, status: "collected" }).populate("donor");
		res.render("consultant/previousCollections", { title: "Previous Collections", previousCollections });
	}
	catch(err)
	{
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/consultant/collection/view/:collectionId", middleware.ensureconsultantLoggedIn, async (req,res) => {
	try
	{
		const collectionId = req.params.collectionId;
		const collection = await Donation.findById(collectionId).populate("donor");
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
		await Donation.findByIdAndUpdate(collectionId, { status: "collected", collectionTime: Date.now() });
		req.flash("success", "Donation collected successfully");
		res.redirect(`/consultant/collection/view/${collectionId}`);
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
		const updateObj = req.body.agent;	// updateObj: {name, lastName, gender, address, phone}
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