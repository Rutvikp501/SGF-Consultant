const { calculateCycle, calculateLeadCycle, generateLeadID } = require('../helpers/sample');
const LeadModel = require('../models/lead.models');
const UserModel = require('../models/user');
const ConvertedLeadModel = require('../models/convertedLead.model');
const JunkLeadModel = require('../models/junkLead.model');
const { bitrixaddLead } = require('../utility/bitrix');
const {getCommissionexcel} = require('../utility/excel.util');
const { samples } = require("../utility/email.util.js");
const packagesModel = require('../models/packages.model');
const LeadBackupModel = require('../models/leadbackup.model');
const consultantModel = require('../models/consultant.model.js');
const jwt = require('jsonwebtoken');
const token = process.env.token


exports.addLead = async (req, res) => {

    let params = req.body;
    
    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        let consultantDetails = await consultantModel.findById(params.consultant);
        if (!consultantDetails) {
            return res.send({
                success: false,
                statusCode: 404,
                message: 'Consultant not found'
            });
        }

        const leadcycle = calculateLeadCycle(params.leadType, currentDate);

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

        const duplicatecode = await LeadModel.find({ leadID: leadID });
        if (duplicatecode.length > 0) {
            return res.send({
                success: false,
                statusCode: 400,
                message: 'LeadID already exists.'
            });
        }

        const formattedEvents = params.events.map(event => ({
            name: event.name || 'Unnamed Event',
            date: new Date(event.date),
            location: event.location || 'Not specified',
            timing: event.timing || 'Not specified',
        }));

        const packageData = {
            name: params.package?.name || 'NA',
            subname: params.package?.subname || 'NA',
            addonS: params.package?.addOns ? params.package.addOns.split(',').map(item => item.trim()) : [],
            amount: parseFloat(params.package?.amount) || 0
        };

        const LeadData = {
            consultant: consultantDetails._id,
            consultant_code: consultantDetails.code,
            consultant_mobile_no: consultantDetails.mobile_no,
            consultant_email_id: consultantDetails.email_id,
            consultant_name: consultantDetails.name,
            name: params.name,
            email: params.email,
            phone: params.phone,
            homeaddress: params.homeaddress,
            events: formattedEvents,
            pincode: params.pincode,
            eventSpecialsName: params.eventSpecialsName,
            specialCode: params.specialCode,
            leadType: params.leadType,
            status: params.status,
            leadID: leadID,
            cycle: { label: leadcycle.Label, number: leadcycle.Number, year: leadcycle.year },
            currentDate: currentDate,
            package: packageData
        };

        const bitrixres = await bitrixaddLead(LeadData);

        if (bitrixres.status) {
            await consultantDetails.save();
            const lead = new LeadModel({
                ...LeadData,
                bitrixres: {
                    leadno: bitrixres.leadno || '',
                    message: bitrixres.message || ''
                }
            });
            await lead.save();

            return res.send({
                success: true,
                statusCode: 201,
                message: 'Lead added successfully',
                data: lead
            });

        } else {
            const leadBackup = new LeadBackupModel({
                ...LeadData,
                bitrixres: {
                    leadno: bitrixres.leadno || '',
                    message: bitrixres.message || ''
                }
            });
            await leadBackup.save();
            //await samples(params.name,params.email,formattedEvents[0].name); 
            console.error(bitrixres.error);
            return res.send({
                success: false,
                statusCode: bitrixres.statusCode,
                message: `Error adding Lead Contact Sales Assistant`
            });
        }
    } catch (error) {
        console.error(error);
        return res.send({
            success: false,
            statusCode: 500,
            message: 'Error adding Lead Contact Sales Assistant'
        });
    }
};


exports.getAllLeads = async (req, res) => {
    let { status } = req.body;

    try {
        // const leads = await LeadModel.find();
        let leads;
        // Determine which model to query based on the status
        if (status === 'pending') {
            leads = await LeadModel.find({ status: 'pending' });
        } else if (status === 'converted') {
            // leads = await LeadModel.find({ status: 'pending' });
            leads = await ConvertedLeadModel.find();
        } else if (status === 'junk') {
            // leads = await LeadModel.find({ status: 'pending' });
            leads = await JunkLeadModel.find();
        } else {
            // If no valid status is provided, return an error
            leads = await LeadModel.find();
        }
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
            data: leads
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

exports.getSearchedlead = async (req, res) => {
    try {
        // const authHeader = req.headers.authorization;
        // const authtoken = authHeader.split(" ")[1];
        // const decode = jwt.verify(authtoken,token)

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
            data: allSearchedLeads
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
            return res.send({
                success: false,
                statusCode: 404,
                message: 'No additional data found for this lead'
            });
        }
        res.send({
            success: true,
            statusCode: 200,
            data: associates
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
    const authHeader = req.headers.authorization;
    const authtoken = authHeader.split(" ")[1];
    const decode = jwt.verify(authtoken, token)
    const consultantId = decode.UserId;
    // const consultantId = "66ab659fdec07a2c29fd9609";
    const RegularLeads = {};
    const SeasonalLeads = {};
    try {
        RegularLeads.numAllLeads = await LeadModel.countDocuments({ consultant: consultantId, });
        // Regular Leads Counts
        RegularLeads.numPendingLeads = await LeadModel.countDocuments({ consultant: consultantId, leadType: "Regular", status: "Pending" });
        RegularLeads.numAllLeads = await LeadModel.countDocuments({ consultant: consultantId, leadType: "Regular" });
        RegularLeads.numConvertedLeads = await LeadModel.countDocuments({ consultant: consultantId, leadType: "Regular", status: "Converted" });
        RegularLeads.numJunkLeads = await LeadModel.countDocuments({ consultant: consultantId, leadType: "Regular", status: "Junk" });

        // Seasonal Leads Counts  
        SeasonalLeads.numPendingLeads = await LeadModel.countDocuments({ consultant: consultantId, leadType: "Seasonal", status: "Pending" });
        SeasonalLeads.numAllLeads = await LeadModel.countDocuments({ consultant: consultantId, leadType: "Seasonal" });
        SeasonalLeads.numConvertedLeads = await LeadModel.countDocuments({ consultant: consultantId, leadType: "Seasonal", status: "Converted" });
        SeasonalLeads.numJunkLeads = await LeadModel.countDocuments({ consultant: consultantId, leadType: "Seasonal", status: "Junk" });

        res.send({
            success: true,
            statusCode: 200,
            data: { RegularLeads, SeasonalLeads }
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

exports.getDashboardData = async (req, res) => {
    const authHeader = req.headers.authorization;
    const authtoken = authHeader.split(" ")[1];
    const decode = jwt.verify(authtoken, token)
    const consultantId = decode.UserId || "66ab659fdec07a2c29fd9609";
    // const decode = req.query
    // const consultantId = decode.consultantId;
    const RegularLeads = {};
    const SeasonalLeads = {};
    try {
        RegularLeads.numPendingLeads = await LeadModel.countDocuments({ consultant: consultantId, leadType: "Regular", status: "Pending" });
        RegularLeads.numConvertedLeads = await ConvertedLeadModel.countDocuments({ consultant: consultantId, leadType: "Regular" });
        RegularLeads.numJunkLeads = await JunkLeadModel.countDocuments({ consultant: consultantId, leadType: "Regular", status: "Junk" });

        // Total regular leads = pending + converted + junk
        RegularLeads.numAllLeads = RegularLeads.numPendingLeads + RegularLeads.numConvertedLeads + RegularLeads.numJunkLeads;

        // Seasonal Leads Counts  
        SeasonalLeads.numPendingLeads = await LeadModel.countDocuments({ consultant: consultantId, leadType: "Seasonal", status: "Pending" });
        SeasonalLeads.numConvertedLeads = await ConvertedLeadModel.countDocuments({ consultant: consultantId, leadType: "Seasonal" });
        SeasonalLeads.numJunkLeads = await JunkLeadModel.countDocuments({ consultant: consultantId, leadType: "Seasonal", status: "Junk" });

        // Total seasonal leads = pending + converted + junk
        SeasonalLeads.numAllLeads = SeasonalLeads.numPendingLeads + SeasonalLeads.numConvertedLeads + SeasonalLeads.numJunkLeads;

        // Total all leads = regular leads + seasonal leads
        let AllLeads  = RegularLeads.numAllLeads + SeasonalLeads.numAllLeads;
        const leadsData = [

            {
                "title": "ALL Leads",
                "des": "Counts for All Leads",
                "status": AllLeads
            },
            {
                "title": "Regular ALL Leads ",
                "des": "Counts for All Leads",
                "status": RegularLeads.numAllLeads,
                "subList": [
                    {
                        "title": "Regular Pending Leads",
                        "des": "Counts for Pending Leads",
                        "key": "Pending",
                        "status": RegularLeads.numPendingLeads
                    },
                    {
                        "title": "Regular Converted Leads",
                        "des": "Counts for Converted Leads",
                        "key": "Converted",
                        "status": RegularLeads.numConvertedLeads
                    },
                    {
                        "title": "Regular Junk Leads",
                        "des": "Counts for Junk Leads",
                        "key": "Junk",
                        "status": RegularLeads.numJunkLeads
                    },
                ]
            },
            {
                "title": "Seasonal ALL Leads",
                "des": "Counts for All Leads",
                "status": SeasonalLeads.numAllLeads,
                "subList": [
                    {
                        "title": "Seasonal Pending Leads",
                        "des": "Counts for Pending Leads",
                        "key": "Pending",
                        "status": SeasonalLeads.numPendingLeads
                    },
                    {
                        "title": "Seasonal Converted Leads",
                        "des": "Counts for Converted Leads",
                        "key": "Converted",
                        "status": SeasonalLeads.numConvertedLeads
                    },
                    {
                        "title": "Seasonal Junk Leads",
                        "des": "Counts for Junk Leads",
                        "key": "Junk",
                        "status": SeasonalLeads.numJunkLeads
                    }
                ]
            },
        ];
        //console.log(leadsData);

        res.send({
            success: true,
            statusCode: 200,
            data: leadsData
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

exports.getconvertedLeads = async (req, res) => {
    const authHeader = req.headers.authorization;
    const authtoken = authHeader.split(" ")[1];
    const decode = jwt.verify(authtoken, token)
    const consultantId = decode.UserId|| "66ab659fdec07a2c29fd9609";
    
    // const decode = req.query
    // const consultantId = decode.consultantId;
    try {
        // Fetch all converted leads for the consultant
        const allConvertedLeads = await ConvertedLeadModel.find({ consultant: consultantId });

        // Separate seasonal and regular leads
        const seasonalLeads = allConvertedLeads.filter(lead => lead.leadType === "Seasonal");
        const regularLeads = allConvertedLeads.filter(lead => lead.leadType === "Regular");

        const leadsData = {
            allConvertedLeads,
            seasonalLeads,
            regularLeads
        };

        // Respond with the calculated data
        res.send({
            success: true,
            statusCode: 200,
            leads: leadsData,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            statusCode: 500,
            message: 'Internal server error',
        });
    }
};

exports.getconvertedLeadsCommission = async (req, res) => {
    const authHeader = req.headers.authorization;
    const authtoken = authHeader.split(" ")[1];
    const decode = jwt.verify(authtoken, token)
    const consultantId = decode.UserId|| "66ab659fdec07a2c29fd9609";
    
    // const decode = req.query
    // const consultantId = decode.consultantId;
    try {
        // Fetch all converted leads for the consultant
        const allConvertedLeads = await ConvertedLeadModel.find({ consultant: consultantId });

        // Separate seasonal and regular leads
        const seasonalLeads = allConvertedLeads.filter(lead => lead.leadType === "Seasonal");
        const regularLeads = allConvertedLeads.filter(lead => lead.leadType === "Regular");

        // Calculate totals for all leads
        const { totalAmount, totalCommission } = calculateTotals(allConvertedLeads);

        // Calculate totals for seasonal leads
        const { totalAmount: seasonalTotalAmount, totalCommission: seasonalTotalCommission } = calculateTotals(seasonalLeads);

        // Calculate totals for regular leads
        const { totalAmount: regularTotalAmount, totalCommission: regularTotalCommission } = calculateTotals(regularLeads);

        // Prepare data response
        const earningData = [
            {
                "title": "ALL Earnings",
                "des": "Total earnings for all leads",
                "status": totalCommission
            },
            {
                "title": "Regular ALL Earnings",
                "des": "Total earnings for all regular leads",
                "status":  regularTotalCommission,
               
                "subList": [
                    {
                        "title": "Regular Total Amount",
                        "des": "Total amount from regular leads",
                        "key": "Amount",
                        "status": regularTotalAmount
                    },
                    {
                        "title": "Regular Total Commission",
                        "des": "Total commission from regular leads",
                        "key": "Commission",
                        "status": regularTotalCommission
                    }
                ]
            },
            {
                "title": "Seasonal ALL Earnings",
                "des": "Total earnings for all seasonal leads",
                "status":seasonalTotalCommission,
                "subList": [
                    {
                        "title": "Seasonal Total Amount",
                        "des": "Total amount from seasonal leads",
                        "key": "Amount",
                        "status": seasonalTotalAmount
                    },
                    {
                        "title": "Seasonal Total Commission",
                        "des": "Total commission from seasonal leads",
                        "key": "Commission",
                        "status": seasonalTotalCommission
                    }
                ]
            }
        ];

        // Respond with the calculated data
        res.send({
            success: true,
            statusCode: 200,
            earnings: earningData,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            statusCode: 500,
            message: 'Internal server error',
        });
    }
};

exports.getconvertedleadsview = async (req, res) => {
    const leadId = req.params.leadId;
    const Leads = await ConvertedLeadModel.findById(leadId);
    try {
        const excelBuffer = await getCommissionexcel(Leads);
        res.send({
            success: true,
            statusCode: 200,
            data: Leads,
            excelBuffer:excelBuffer
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

exports.getpendingLeads = async (req, res) => {
    const authHeader = req.headers.authorization;
    const authtoken = authHeader.split(" ")[1];
    const decode = jwt.verify(authtoken, token)
    const consultantId = decode.UserId;
    // const decode = req.query
    // const consultantId = decode.consultantId;
    const pendingLeads = await LeadModel.find({ consultant: consultantId, status: "Pending" });
    const RegularLeads = await LeadModel.find({ consultant: consultantId, leadType: "Regular" });
    const SeasonalLeads = await LeadModel.find({ consultant: consultantId, leadType: "Seasonal" });

    try {
        res.send({
            success: true,
            statusCode: 200,
            data: pendingLeads
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

exports.getleadsview = async (req, res) => {
    const leadId = req.params.leadId;
    const Leads = await LeadModel.findById(leadId).populate("consultant");
    try {
        res.send({
            success: true,
            statusCode: 200,
            data: Leads
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

exports.packages = async (req, res, isWebForm = false) => {
    try {
        const { type } = req.query;
        if (!type || (type !== 'Regular' && type !== 'Seasonal')) {
            return res.send({
                success: false,
                statusCode: 400,
                message: 'Invalid type. Must be "Regular" or "Seasonal".' 
            });
        }
        const packages = await packagesModel.find({ type: type }, 'name');
        if (packages.length === 0) {
            return res.send({
                success: false,
                statusCode: 404,
               message: `No packages found for type "${type}"`
            });
        }
        return res.send({
            success: true,
            statusCode: 200,
            packages: packages.map(pkg => pkg.name)
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

exports.updateLeadstage = async (req, res) => {
    try {
        const leadId = req.params.leadId;
        const Leads = await LeadModel.findById(leadId).populate("consultant");
        let data = {
            leadId:"",
            ladId:"",
            leadId:"",
        }

        return res.send({
            success: true,
            statusCode: 201,
            message: 'Updated lead stage',
        });
      
    } catch (err) {
        console.error('Error updating lead stage', err.message);
        return res.send({
            success: false,
            statusCode: 500,
            message: 'Error updating lead stage'
        });
    }
}

exports.updateLeadquotation = async (req, res) => {
    try {
        const leadId = req.params.leadId;
        const Leads = await LeadModel.findById(leadId).populate("consultant");
        let data = {

        }


        return res.send({
            success: true,
            statusCode: 201,
            message: 'Updated lead quotation',
        });
    } catch (err) {
        console.error('Error updating lead quotation', err.message);
        return res.send({
            success: false,
            statusCode: 500,
            message: 'Error updating lead quotation'
        });
    }
}


const calculateTotals = (leads) => {
    let totalAmount = 0;
    let totalCommission = 0;

    leads.forEach(lead => {
        lead.invoice.forEach(inv => {
            totalAmount += parseFloat(inv.totalamount);
            totalCommission += parseFloat(inv.commission);
        });
    });

    return { totalAmount, totalCommission };
};

