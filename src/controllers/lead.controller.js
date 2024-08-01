const { calculateCycle, calculateLeadCycle, generateLeadID } = require('../helpers/sample');
const LeadModel = require('../models/lead.models');
const UserModel = require('../models/user.models');

exports.addLead = async (req, res) => {
    const { Adviser, name, email, phone, eventName, eventDate, eventLocation, pincode, eventSpecialsName, specialCode, leadType, status, } = req.body;
    // console.log(req.body);
    try {

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const { cycleLabel, cycleNumber } = calculateCycle(currentDate);
        const consultantDetails = await UserModel.findById(Adviser);
       
        if (!consultantDetails) {
            return res.status(404).send({ message: 'Consultant not found' });
        }
        consultantDetails.calculateLifetimeCycleNumber();
        const leadcycle = calculateLeadCycle(leadType, currentDate)
        let leadNumber = 1;
        let cycleKey = `${currentYear}-${leadcycle.Label}`;
        
        if (leadType === 'Seasonal') {
            leadNumber = (consultantDetails.leadsPerCycle.seasonal.get(cycleKey) || 0) + 1;
            consultantDetails.leadsPerCycle.seasonal.set(cycleKey, leadNumber);
        } else {
            leadNumber = (consultantDetails.leadsPerCycle.regular.get(cycleKey) || 0) + 1;
            consultantDetails.leadsPerCycle.regular.set(cycleKey, leadNumber);
        }
        const leadID = generateLeadID(consultantDetails.code, leadType, leadcycle.Label, consultantDetails.consultantLifetimeCycleNumber, leadNumber, pincode);
        const duplicatecode = await LeadModel.find({ leadIDd: leadID }); 
        if(duplicatecode!=""){
            return res.status(400).send({status: "failed", message: "leadID already exist." })
        }
        await consultantDetails.save();

        const lead = new LeadModel({
            consultant: consultantDetails._id,
            consultant_code: consultantDetails.code,
            name: name,
            email: email,
            phone: phone,
            eventName: eventName,
            eventDate: eventDate,
            eventLocation: eventLocation,
            pincode: pincode,
            eventSpecialsName: eventSpecialsName,
            specialCode: specialCode,
            leadType: leadType,
            status: status,
            leadID: leadID,
            cycle: { label: leadcycle.Label, number: leadcycle.Number,year:leadcycle.year }
        });
        await lead.save();
        res.status(201).send({ message: 'Lead added successfully', lead });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

exports.getLeadsByAdviser = async (req, res) => {
    const { adviserId } = req.params;

    try {
        const leads = await LeadModel.find({ Adviser: adviserId });
        if (!leads.length) {
            return res.status(404).send({ message: 'No leads found for this adviser' });
        }
        res.status(200).send(leads);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

exports.getAdditionalData = async (req, res) => {
    const { leadId } = req.params;
    try {
        const lead = await LeadModel.findById(leadId);
        if (!lead) {
            return res.status(404).send({ message: 'No lead found' });
        }

        const { associates } = lead;
        if (!associates) {
            return res.status(404).send({ message: 'No additional data found for this lead' });
        }

        res.status(200).send(associates);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};
