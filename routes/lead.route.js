const express = require('express');
const router = express.Router();
const leadController = require('../controllers/lead.controller');

router.post('/addLead', leadController.addLead);
router.get('/getAllLeads', leadController.getAllLeads);
router.post('/getSearchedlead', leadController.getSearchedlead);
router.get('/getAdditionalData/:leadId', leadController.getAdditionalData);
module.exports = router;