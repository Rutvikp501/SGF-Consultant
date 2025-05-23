



const express = require('express');
const admincontroller = require('../controllers/admin.controller');
const eventcontroller = require('../controllers/event.controller');
const router = express.Router();


router.post('/login',admincontroller.Login)

router.get('/dashboard', admincontroller.getDashboard);
router.get('/Leads/all', admincontroller.getAllLeads);
router.get('/Leads/converted', admincontroller.getConvertedLeads);
router.get('/Leads/view/:LeadsId', admincontroller.viewLeadDetails);
router.post('/Leads/converte/:LeadsId', admincontroller.convertLead);
router.post('/Leads/reject/:LeadsId', admincontroller.rejectLead);
router.get('/consultants', admincontroller.getconsultants);
router.get('/admins', admincontroller.getadmins);
router.post('/addUser', admincontroller.addUser);
router.get('/upload-multiple/:id', admincontroller.getuploadPhotosPage);
router.post('/upload-multiple/:id', admincontroller.uploadPhotosPage);
router.get('/profile', admincontroller.getAllLeads);
router.put('/profile', admincontroller.getAllLeads);



router.get('/test', admincontroller.getAllLeads);
router.post('/createproforma', admincontroller.createproforma);
router.post('/addinventorys', admincontroller.addInventory);
router.get('/getinventorys', admincontroller.getInventory);
router.get('/getpackages', admincontroller.getpackages);
router.post('/addpackages', admincontroller.addpackages);

router.post('/eventroadmap', eventcontroller.eventroadmap);

module.exports = router;