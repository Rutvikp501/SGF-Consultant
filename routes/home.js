const express = require("express");
const router = express.Router();

router.get("/", (req,res) => {
	res.render("auth/login");
});

router.get("/home/about-us", (req,res) => {
	res.render("home/aboutUs", { title: "About Us | Prajaahar Rakshak" });
});

router.get("/home/mission", (req,res) => {
	res.render("home/mission", { title: "Our mission | Prajaahar Rakshak" });
});

router.get("/home/contact-us", (req,res) => {
	res.render("home/contactUs", { title: "Contact us | Prajaahar Rakshak" });
});


module.exports = router;