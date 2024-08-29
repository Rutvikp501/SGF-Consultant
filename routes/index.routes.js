
const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const Admin  = require('../controllers/admin.controler');
router.post('/leadapi/addLead', leadController.addLead);
router.get('/leadapi/getAllLeads', leadController.getAllLeads);
router.get('/leadapi/getLeadscount', leadController.getLeadscount);
router.get('/leadapi/getDashboardData', leadController.getDashboardData);
router.get('/leadapi/getconvertedLeads', leadController.getconvertedLeads);
router.get('/leadapi/getpendingLeads', leadController.getpendingLeads);
router.get('/leadapi/getleadsview/:leadId', leadController.getleadsview);
router.post('/leadapi/getSearchedLeads', leadController.getLeadsByAdviser);
router.get('/leadapi/getAdditionalData/:leadId', leadController.getAdditionalData);


router.get('/adminapi/',Admin.GetAllUser)
router.post('/adminapi/getSearcheduser',Admin.GetSearchedUser)
router.post('/adminapi/login',Admin.Login)
router.post('/adminapi/register',Admin.Register)
router.post('/adminapi/edit',Admin.Edit)
router.patch('/adminapi/update/:id', Admin.Update);
router.delete('/adminapi/delete/:id', Admin.Delete);
router.post('/adminapi/forgotPassword',Admin.forgotPassword)
router.post('/adminapi/resetPassword',Admin.resetPassword)

module.exports = router;
// app.use('/adviser',require('./adviser.route'));