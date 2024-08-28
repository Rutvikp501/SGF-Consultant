const { calculateCycle, calculateLeadCycle, generateLeadID } = require('../helpers/sample');
const LeadModel = require('../models/lead.models');
const UserModel = require('../models/user');
const token = process.env.token
exports.addLead = async (req, res) => {
    const { Adviser, name, email, phone, eventName, eventDate, eventLocation, pincode, eventSpecialsName, specialCode, leadType, status, } = req.body;
    // console.log(req.body);
    try {

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const { cycleLabel, cycleNumber } = calculateCycle(currentDate);
        const consultantDetails = await UserModel.findById(Adviser);
       
        if (!consultantDetails) {
            return res.send({
                success: false,
                statusCode: 404,
                message: 'Consultant not found'
            });
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
            return res.send({
                success: false,
                statusCode: 400,
                message: "leadID already exist."
            }); 
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
        res.send({
            success: true,
            statusCode: 201,
             message: 'Lead added successfully',
            data:lead
        });
    } catch (error) {
        console.error(error);
        res.send({
            success: false,
            statusCode: 500,
             message: 'Internal server error'
        });
    }
};

exports.getAllLeads = async (req, res) => {

    try {
        const leads = await LeadModel.find();
        if (!leads.length) {
            return res.send({
                success: false,
                statusCode: 404,
                 message: 'No leads found '
            });
        }
        res.send({
            success: true,
            statusCode: 200,
           data:leads
        });
    } catch (error) {
        console.error(error);
        res.send({
            success: false,
            statusCode: 500,
            message: 'Internal server error' 
        });
    }
};

exports.getLeadsByAdviser = async (req, res) => {
    try {
        const params = req.body || '';
        const searchParam = params.search;
        const filter = {};
    
        if (searchParam) {
          filter.$or = [
            { consultant_code: { $regex: searchParam, $options: 'i' } },
            { leadID: { $regex: searchParam, $options: 'i' } },
            { email: { $regex: searchParam, $options: 'i' } },
            { leadType: { $regex: searchParam, $options: 'i' } },
            { pincode: { $regex: searchParam, $options: 'i' } },
            { status: { $regex: searchParam, $options: 'i' } }
          ];
        }
    
        const allSearchedLeads = await LeadModel.aggregate([
          { $match: filter }
        ]);
    
        return res.send({
            success: true,
            statusCode: 200,
            data:allSearchedLeads
        });
      } catch (error) {
        console.log(error);
        next(error);
      }
};

exports.getAdditionalData = async (req, res) => {
    const { leadId } = req.params;
    try {
        const lead = await LeadModel.findById(leadId);
        if (!lead) {
            return res.send({
                success: false,
                statusCode: 404,
                message: 'No lead found' 
            });
        }

        const { associates } = lead;
        if (!associates) {
            return  res.send({
                success: false,
                statusCode: 404,
                message: 'No additional data found for this lead' 
            });
        }
        res.send({
            success: true,
            statusCode: 200,
            data:associates
        });
    } catch (error) {
        console.error(error);
        res.send({
            success: false,
            statusCode: 500,
            message: 'Internal server error'
        });
    }
};

exports.getLeadscount = async (req, res) => {
    const authHeader = req.header.authHeader;
    const authtoken = authHeader.split(" ")[1];
    const decode = jwt.verify(authtoken,token)
    const consultantId = req.user._id;
    const RegularLeads = {};
    const SeasonalLeads = {};
    try {
        RegularLeads.numAllLeads = await LeadModel.countDocuments({consultant: consultantId,});
        // Regular Leads Counts
        RegularLeads.numPendingLeads = await LeadModel.countDocuments({ consultant: consultantId,leadType: "Regular",status: "Pending" });
        RegularLeads.numAllLeads = await LeadModel.countDocuments({consultant: consultantId,leadType: "Regular" });
        RegularLeads.numConvertedLeads = await LeadModel.countDocuments({consultant: consultantId,leadType: "Regular",status: "Converted"  });
        RegularLeads.numJunkLeads = await LeadModel.countDocuments({consultant: consultantId,leadType: "Regular",status: "Junk"  });
    
        // Seasonal Leads Counts  
        SeasonalLeads.numPendingLeads = await LeadModel.countDocuments({consultant: consultantId,leadType: "Seasonal",status: "Pending" });   
        SeasonalLeads.numAllLeads = await LeadModel.countDocuments({consultant: consultantId,leadType: "Seasonal"   });
        SeasonalLeads.numConvertedLeads = await LeadModel.countDocuments({consultant: consultantId,leadType: "Seasonal",status: "Converted"   });
        SeasonalLeads.numJunkLeads = await LeadModel.countDocuments({consultant: consultantId,leadType: "Seasonal",status: "Junk"   });
    
        res.send({
            success: true,
            statusCode: 200,
            data:{ RegularLeads, SeasonalLeads }
        });
    } catch (error) {
        console.error(error);
        res.send({
            success: false,
            statusCode: 500,
            message: 'Internal server error' 
        });
    }
};
