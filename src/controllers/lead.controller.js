const LeadModel = require('../models/lead.models');
const AdviserModel = require('../models/user.models');

exports.addLead = async (req, res) => {
    const {
        consultant, name, email, phone, eventName, eventDate,eventLocation,pincode,eventSpecialsName,specialCode,leadType,status,cycle,conversionDate} = req.body;
    
    try {

        const lead = new LeadModel({
            consultant:consultant,
            name:name,
            email:email,
            phone:phone,
            eventName:eventName,
            eventDate:eventDate,
            eventLocation:eventLocation,
            pincode:pincode,
            eventSpecialsName:eventSpecialsName,
            specialCode:specialCode,
            leadType:leadType,
            status:status,
            leadID:leadID,
            cycle:cycle,
            conversionDate:conversionDate,
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
