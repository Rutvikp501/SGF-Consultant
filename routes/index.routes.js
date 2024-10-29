
const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const Admin  = require('../controllers/admin.controller');
const bitrix = require('../utility/bitrix');


router.post('/leadapi/addLead', leadController.addLead);
router.get('/leadapi/getAllLeads', leadController.getAllLeads);
router.get('/leadapi/getLeadscount', leadController.getLeadscount);
router.get('/leadapi/getDashboardData', leadController.getDashboardData);

router.get('/leadapi/getconvertedLeads', leadController.getconvertedLeads);
router.get('/leadapi/getconvertedleadsview/:leadId', leadController.getconvertedleadsview);
router.get('/leadapi/getconvertedLeadsCommission', leadController.getconvertedLeadsCommission);

router.get('/leadapi/getpendingLeads', leadController.getpendingLeads);
router.post('/leadapi/getSearchedlead', leadController.getSearchedlead);

router.get('/leadapi/getleadsview/:leadId', leadController.getleadsview);
router.get('/leadapi/getAdditionalData/:leadId', leadController.getAdditionalData);


router.get('/adminapi/',Admin.GetAllUser)
router.post('/adminapi/getUserData',Admin.GetUserData)
router.post('/adminapi/getSearcheduser',Admin.GetSearchedUser)
router.post('/adminapi/login',Admin.Login)
router.post('/adminapi/register',Admin.Register)
router.post('/adminapi/edit',Admin.Edit)
router.patch('/adminapi/update/:id', Admin.Update);
router.delete('/adminapi/delete/:id', Admin.Delete);
router.post('/adminapi/forgotPassword',Admin.forgotPassword)
router.post('/adminapi/resetPassword',Admin.resetPassword)

router.get('/exceluserdata',Admin.getuserexcel)

// router.post('/bitrix/getconvertedleads',bitrix.getConvertedLead)
// router.get('/bitrix/getleaddata',bitrix.getleaddatadata)
// router.get('/bitrix/moveTojunk:ID',bitrix.moveTojunk)
// router.get('/bitrix/updateLeadstage:ID',bitrix.updateLeadstage)
// router.get('/bitrix/updateLeadquotation:ID',bitrix.updateLeadquotation)
// router.get('/packages', leadController.packages);

router.post('/bitrix/convertedleads',bitrix.getConvertedLead)
router.get('/bitrix/getdata:ID',bitrix.getdata)
router.get('/bitrix/moveTojunk:ID',bitrix.moveTojunk)
router.get('/bitrix/updateLeadstage:ID',bitrix.updateLeadstage)
router.get('/bitrix/updateLeadquotation:ID',bitrix.updateLeadquotation)
router.get('/packages', leadController.packages);


module.exports = router;