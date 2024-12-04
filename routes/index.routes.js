
const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');
const Auth  = require('../controllers/auth.controller');
const bitrix = require('../utility/bitrix');


router.post('/leadapi/addLead', leadController.addLead);
router.get('/leadapi/getAllLeads', leadController.getAllLeads);
// router.get('/leadapi/getLeadscount', leadController.getLeadscount);
router.get('/leadapi/getDashboardData', leadController.getDashboardData);

router.get('/leadapi/getconvertedLeads', leadController.getconvertedLeads);
router.get('/leadapi/getconvertedleadsview/:leadId', leadController.getconvertedleadsview);
router.get('/leadapi/getconvertedLeadsCommission', leadController.getconvertedLeadsCommission);

router.get('/leadapi/getpendingLeads', leadController.getpendingLeads);
router.post('/leadapi/getSearchedlead', leadController.getSearchedlead);

router.get('/leadapi/getleadsview/:leadId', leadController.getleadsview);
// router.get('/leadapi/getAdditionalData/:leadId', leadController.getAdditionalData);


router.get('/adminapi/',Auth.GetAllUser)
router.post('/adminapi/getUserData',Auth.GetUserData)
// router.post('/adminapi/getSearcheduser',Auth.GetSearchedUser)
router.post('/adminapi/login',Auth.Login)
router.post('/adminapi/register',Auth.Register)
router.post('/adminapi/edit',Auth.Edit)
router.patch('/adminapi/update/:id', Auth.Update);
router.delete('/adminapi/delete/:id', Auth.Delete);
router.post('/adminapi/forgotPassword',Auth.forgotPassword)
router.post('/adminapi/resetPassword',Auth.resetPassword)

router.get('/exceluserdata',Auth.getuserexcel)

router.post('/bitrix/getconvertedleads',bitrix.getConvertedLead)
router.get('/bitrix/getleaddata',bitrix.getstagedata)
router.get('/bitrix/moveTojunk:ID',bitrix.moveTojunk)
router.get('/bitrix/updateLeadstage:ID',bitrix.updateLeadstage)
router.get('/bitrix/updateLeadquotation:ID',bitrix.updateLeadquotation)
router.get('/packages', leadController.packages);



module.exports = router;