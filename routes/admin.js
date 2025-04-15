const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const middleware = require("../middleware/index.js");
const UserModel = require("../models/user.js");

const adminModel = require("../models/admin.model");
const consultantModel = require("../models/consultant.model.js");
const LeadModel = require("../models/lead.models.js");
const ConvertedLeadModel = require("../models/convertedLead.model.js");
const JunkLeadModel = require("../models/junkLead.model.js");
const { calculateCycle, } = require("../helpers/common.js");
const { Consultant_Wellcome } = require("../utility/email.util.js");
const { addLead } = require("../controllers/lead.controller.js");
const packagesModel = require("../models/packages.model.js");
const { cloudinaryUpload } = require("../config/cloudinary.js");
const { adminregistationquery, consultantregistationquery, updateUserPhotos, addinventoryquery, updateConsultantQuery, transformedData, updateAdminQuery, createOrUpdateProforma, addPackagesQuery } = require("../query/admin.query.js");
const inventorysModel = require("../models/inventory.model.js");
const { create_proforma, create_Package_proforma ,create_corporate_proforma} = require("../utility/pdf.js");
const { sendEmailWithPdf } = require("../helpers/email.js");
const { generateRoadmap } = require("../utility/event_roadmap_budget.js");
const { eventroadmap } = require("../controllers/event.controller.js");

router.get("/admin/dashboard", middleware.ensureAdminLoggedIn, async (req, res) => {
	const { department } = req.user;
	const numAdmins = await adminModel.countDocuments();
	const numconsultant = await consultantModel.countDocuments();
	const numPendingLeads = await LeadModel.countDocuments({ status: "Pending" });
	const numConvertedLeads = await LeadModel.countDocuments({ status: "Converted" });
	const numJunkLeads = await LeadModel.countDocuments({ status: "Junk" });
	res.render("admin/dashboard", {
		title: "Dashboard",
		numAdmins, numconsultant, numPendingLeads, numConvertedLeads, numJunkLeads, department
	});
});

router.get("/admin/Leads/all", middleware.ensureAdminLoggedIn, async (req, res) => {
	const { department } = req.user;
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

		res.render("admin/allLeads", { title: "Pending Leads", allLeads, search, sortBy, order, department });
	} catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.");
		res.redirect("back");
	}
});

router.get("/admin/Leads/converted", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const ConvertedLeads = await LeadModel.find({ status: "Converted" }).populate("consultant");

		res.render("admin/convertedLeads", { title: "Converted Leads ", ConvertedLeads, department });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/Leads/view/:LeadsId", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const { department } = req.user;
		const LeadsId = req.params.LeadsId;
		const Leads = await LeadModel.findById(LeadsId).populate("consultant");
		const ConvertedLeads = await ConvertedLeadModel.find({ leadID: Leads.leadID });

		res.render("admin/leads", { title: "Leads details", Leads: Leads, ConvertedLeads: ConvertedLeads, department });
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
	const { department } = req.user;
	try {
		const consultant = await consultantModel.find();
		// console.log(consultant);

		res.render("admin/Consultants", { title: "List of consultant", consultant, department });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/admins", middleware.ensureAdminLoggedIn, async (req, res) => {
	const { department } = req.user;
	try {
		const admins = await adminModel.find();

		res.render("admin/admins", { title: "List of Admin", admins, department });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/addUser", middleware.ensureAdminLoggedIn, async (req, res) => {
	const { department } = req.user;
	try {
		const consultants = await consultantModel.find();
		res.render("admin/addUser", { title: "List of users", consultants, department });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}


});

router.post("/admin/addUser", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const params = req.body;

		if (!params.role) {
			req.flash("error", "Role is required.");
			return res.redirect("back");
		}

		let result;
		if (params.role === "admin") {
			result = await adminregistationquery(params);
		} else if (params.role === "consultant") {
			result = await consultantregistationquery(params);
		} else {
			req.flash("error", "Invalid role specified.");
			return res.redirect("back");
		}

		if (result.success) {
			req.flash("success", result.message);
			res.redirect("/admin/consultants");
		} else {
			req.flash("error", result.message);
			res.redirect("back");
		}
	} catch (err) {
		console.error(err);
		req.flash("error", "Some error occurred on the server.");
		res.redirect("back");
	}
});

router.get("/admin/admins/:id", middleware.ensureAdminLoggedIn, async (req, res) => {
    const { department } = req.user;
    const { id } = req.params;
    
    try {
        const admin = await adminModel.findById(id);
        const admins = await adminModel.find();
		
        if (!admin) {
            req.flash("error", "consultant not found.");
            return res.redirect("back");
        }
        
        res.render("admin/updateadmins", { title: "Update User", admin , admins, department });
    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.");
        res.redirect("back");
    }
});
router.post("/admin/admins/:id", middleware.ensureAdminLoggedIn, async (req, res) => {
    const { id } = req.params;
    const params = req.body;
	
    try {
        
        // Find user by ID and update
        let updatedUser = await updateAdminQuery(params, id); // Assuming this function handles updates for consultant
    
        
        if (updatedUser.success) {
            req.flash("success", updatedUser.message);
            res.redirect("/admin/admins");
        } else {
            req.flash("error", updatedUser.message);
            res.redirect("back");
        }
    } catch (err) {
        console.error(err);
        req.flash("error", "Some error occurred on the server.");
        res.redirect("back");
    }
});
router.get("/admin/updateconsultant/:id", middleware.ensureAdminLoggedIn, async (req, res) => {
    const { department } = req.user;
    const { id } = req.params;
    
    try {
        const consultant = await consultantModel.findById(id);
        const consultants = await consultantModel.find();
		
        if (!consultant) {
            req.flash("error", "consultant not found.");
            return res.redirect("back");
        }
        
        res.render("admin/updateConsultant", { title: "Update User", consultant , consultants, department });
    } catch (err) {
        console.log(err);
        req.flash("error", "Some error occurred on the server.");
        res.redirect("back");
    }
});

router.post("/admin/updateconsultant/:id", middleware.ensureAdminLoggedIn, async (req, res) => {
    const { id } = req.params;
    const params = req.body;
	
    try {
        
        // Find user by ID and update
        let updatedUser = await updateConsultantQuery(params, id); // Assuming this function handles updates for consultant
    
        
        if (updatedUser.success) {
            req.flash("success", updatedUser.message);
            res.redirect("/admin/consultants");
        } else {
            req.flash("error", updatedUser.message);
            res.redirect("back");
        }
    } catch (err) {
        console.error(err);
        req.flash("error", "Some error occurred on the server.");
        res.redirect("back");
    }
});


router.get("/admin/upload-multiple/:id", middleware.ensureAdminLoggedIn, async (req, res) => {
	const { department } = req.user;
	const userId = req.params.id; // Get the user ID from route params
	if (!userId) {
		req.flash("error", "Invalid user ID.");
		return res.redirect("/admin/addUser");
	}

	res.render("admin/addPhoto", {
		title: "Upload User Photos",
		userId, // Pass the userId to the view
		department
	});
});

router.post('/admin/upload-multiple/:id', async (req, res) => {
	const userId = req.params.id;

	if (!userId) {
		req.flash("error", "No user ID found.");
		return res.redirect("back");
	}

	try {
		// Setup for uploading images
		const upload = await cloudinaryUpload();
		upload.fields([
			{ name: 'profilephoto', maxCount: 1 },
			{ name: 'panphoto', maxCount: 1 },
			{ name: 'adharphoto', maxCount: 1 },
		])(req, res, async (err) => {
			if (err) {
				console.error(err);
				req.flash("error", "Error uploading images.");
				return res.redirect("back");
			}

			const profilePhotoUrl = req.files.profilephoto?.[0]?.path || null;
			const panPhotoUrl = req.files.panphoto?.[0]?.path || null;
			const adharPhotoUrl = req.files.adharphoto?.[0]?.path || null;

			// Update the user with photo URLs
			const updateResult = await updateUserPhotos(userId, {
				profilePhotoUrl,
				panPhotoUrl,
				adharPhotoUrl,
			});

			if (!updateResult.success) {
				req.flash("error", updateResult.message);
				return res.redirect("back");
			}

			req.flash("success", "User photos uploaded successfully!");
			res.redirect("/admin/consultants");
		});
	} catch (err) {
		console.error(err);
		req.flash("error", "Failed to upload images.");
		res.redirect("back");
	}
});

router.get("/admin/profile", middleware.ensureAdminLoggedIn, (req, res) => {
	const { department } = req.user;
	res.render("admin/profile", { title: "My profile", department });
});

router.put("/admin/profile", middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const id = req.user._id;
		const updateObj = req.body.admin;	// updateObj: {name, lastName, gender, address, phone}
		await adminModel.findByIdAndUpdate(id, updateObj);

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
	const { department } = req.user;
	try {
		const Leads = await LeadModel.find();
		res.render("admin/addLeads", { title: "List of Leads", Leads, department });
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

router.get("/admin/addinventory", middleware.ensureAdminLoggedIn, async (req, res) => {
	const { department } = req.user;
	try {
		const inventorys = await inventorysModel.find();
		res.render("admin/addinventorys", { title: "List of inventory", inventorys, department });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.post('/admin/addinventory', middleware.ensureAdminLoggedIn, async (req, res) => {


	try {
		const params = req.body;

		let result;

		result = await addinventoryquery(params);


		if (result.success) {
			req.flash("success", result.message);
			res.redirect("/admin/showinventorys");
		} else {
			req.flash("error", result.message);
			res.redirect("back");
		}
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Internal server error' });
	}
});

router.get("/admin/showinventorys", middleware.ensureAdminLoggedIn, async (req, res) => {
	const { department } = req.user;
	try {
		const inventorys = await inventorysModel.find();

		res.render("admin/showinventorys", { title: "List of inventorys", inventorys, department });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});
// GET Edit Page
// Route to show the edit form
router.get('/admin/editinventory/:id', middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const inventory = await inventorysModel.findById(req.params.id);
		if (!inventory) {
			req.flash("error", "Inventory not found.");
			return res.redirect("back");
		}

		res.render('admin/editinventory', {
			inventory,
			department: req.user.department, // 👈 pass department from logged-in user
			currentUser: req.user // 👈 in case the sidebar uses user data
		});
	} catch (err) {
		console.log(err);
		req.flash("error", "Something went wrong.");
		res.redirect("back");
	}
});


// Route to handle the update
router.post('/admin/editinventory/:id', middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
		const { type, name, subname, retail_price } = req.body;
		await inventorysModel.findByIdAndUpdate(req.params.id, {
			type,
			name,
			subname,
			retail_price
		});
		req.flash("success", "Inventory updated successfully.");
		res.redirect('/admin/showinventorys');
	} catch (err) {
		console.log(err);
		req.flash("error", "Error updating inventory.");
		res.redirect("back");
	}
});

router.delete('/admin/deleteinventory/:id', middleware.ensureAdminLoggedIn, async (req, res) => {
	try {
	  await inventorysModel.findByIdAndDelete(req.params.id);
	  res.json({ success: true });
	} catch (err) {
	  console.error(err);
	  res.status(500).json({ success: false });
	}
  });
  



router.get("/admin/addpackages", middleware.ensureAdminLoggedIn, async (req, res) => {
	
	const { department } = req.user;
	try {
		const packages = await packagesModel.find();
		res.render("admin/addpackages", { title: "List of packages", packages, department });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.post('/admin/addpackages', middleware.ensureAdminLoggedIn, async (req, res) => {


	try {
		 const params = req.body;
		
		let result;

		result = await addPackagesQuery(params);
console.log(result);


		if (result.success) {
			req.flash("success", result.message);
			res.redirect("/admin/showpackages");
		} else {
			req.flash("error", result.message);
			res.redirect("back");
		}
	} catch (error) {
		console.error(error);
		res.status(500).send({ message: 'Internal server error' });
	}
});

router.get("/admin/showpackages", middleware.ensureAdminLoggedIn, async (req, res) => {
	
	const { department } = req.user;
	try {
		const packages = await packagesModel.find();

		res.render("admin/showpackages", { title: "List of packages", packages, department });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.get("/admin/createproforma", middleware.ensureAdminLoggedIn, async (req, res) => {
	const { department } = req.user;
	try {
		const inventorys = await inventorysModel.find();
		const packages = await packagesModel.find();
		// console.log(inventorys);

		res.render("admin/createproforma", { title: "List of inventorys", inventorys,packages,department });
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.post("/admin/createproforma", async (req, res) => {
	

    const { items, subtotal, finalTotal } = req.body;
	
	
    const params = req.body;
	console.log(params);
	
    params.discountamnt = subtotal - finalTotal;

    const result = await transformedData({ items });
    const serviceitems = result.serviceitems;
	const packages = await packagesModel.findOne({ package_name: params.package_name });
    let paymentstatus = [
        { isPaid: true, paymentDate: "" },
        { isPaid: false, paymentDate: "" },
        { isPaid: false, paymentDate: "" }
    ];

    let data = { params, serviceitems, paymentstatus };
	
     let pdfBuffer;
    try {
		if (params.service_type=="corporate_service"){
			
			pdfBuffer = await create_corporate_proforma(data);
		}
		else{
			pdfBuffer = await create_proforma(data);
		}
         
        // const pdfBuffer = await create_Package_proforma(packages);

        // Send raw binary data with appropriate headers
        res.setHeader('Content-Disposition', 'attachment; filename=Proforma_with_Terms.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer); // Use end to send raw data
		//const saveproforma = await createOrUpdateProforma(data);
		//sendEmailWithPdf(params.lead_Id,params.booking_name,pdfBuffer)
		
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Internal server error" });
    }
});

router.get("/admin/eventroadmap", middleware.ensureAdminLoggedIn, async (req, res) => {
	const { department } = req.user;
	try {

		res.render("admin/eventroadmap", { title: "List of Events",});
	}
	catch (err) {
		console.log(err);
		req.flash("error", "Some error occurred on the server.")
		res.redirect("back");
	}
});

router.post("/admin/eventroadmap", middleware.ensureAdminLoggedIn, async (req, res) => {
	const params = req.body;
  
	try {
	  const pdfBuffer = await eventroadmap(params); // gets buffer from controller
  
	  res.setHeader('Content-Disposition', 'attachment; filename=Event_Roadmap.pdf');
	  res.setHeader('Content-Type', 'application/pdf');
	  res.setHeader('Content-Length', pdfBuffer.length);
	  res.end(pdfBuffer);
  
	} catch (err) {
	  console.error(err);
	  res.status(500).send({ success: false, message: "Internal server error" });
	}
  });
  

// router.post("/admin/createproforma", middleware.ensureAdminLoggedIn, async (req, res) => {
// 	const { items, subtotal, finalTotal  } = req.body;
// 	const params = req.body
// 	params.discountamnt=(subtotal-finalTotal)
// 	const result = await transformedData({ items });
//     const serviceitems = result.serviceitems;
	
// 	let paymentstatus=[{
// 		isPaid:true,
// 		paymentDate:"29/11/2024"
// 	},
// 	{
// 		isPaid:false,
// 		paymentDate:"29/12/2024"
// 	},
// 	{
// 		isPaid:false,
// 		paymentDate:"29/01/2025"
// 	} ]
  
// let  data = {
// params,
// serviceitems,
// };
// data.paymentstatus=paymentstatus;
// 	try {
// 		//console.log(params);
// 		const pdfBuffer = await create_proforma(data);
// 		res.send({
//             success: true,
//             statusCode: 200,
//             data: data,
//             pdfBuffer:pdfBuffer
//         });
// 		//const saveproforma = await createOrUpdateProforma(data);
// 		// Send the PDF in the response
// 		// res.setHeader('Content-Disposition', 'attachment; filename=Proforma_with_Terms.pdf');
// 		// res.setHeader('Content-Type', 'application/pdf');
// 		// res.end(pdfBuffer);
// 		sendEmailWithPdf(params.lead_Id,params.booking_name,pdfBuffer)
// 		// if (result.success) {
// 		// 	req.flash("success", result.message);
// 		// 	res.redirect("/admin/showinventorys");
// 		// } else {
// 		// 	req.flash("error", result.message);
// 		// 	res.redirect("back");
// 		// }
// 	}
// 	catch (err) {
// 		console.log(err);
// 		req.flash("error", "Some error occurred on the server.")
// 		res.redirect("back");
// 	}
// });
module.exports = router;