const LeadModel = require('../models/lead.models');
const AdviserModel = require('../models/adviser.models');

exports.addLead = async (req, res) => {
    const { Adviser, lead_name, mobile_no, email_id, plan, desc, associates } = req.body;
    
    try {
        // Simulate external API call to get associates details
        const apiResponse = { associates_name: 'John Doe', associates_No: 123456789 };

        const lead = new LeadModel({
            Adviser,
            lead_name,
            mobile_no,
            email_id,
            plan,
            desc,
            associates: {
                associates_name: apiResponse.associates_name,
                associates_No: apiResponse.associates_No
            }
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
