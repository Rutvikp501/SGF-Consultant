const { calculateCycle, calculateLeadCycle, generateLeadID } = require('../helpers/sample');
const LeadModel = require('../models/lead.models');
const UserModel = require('../models/user');
const jwt = require('jsonwebtoken');
const ConvertedLeadModel = require('../models/convertedLead.model');
const JunkLeadModel = require('../models/junkLead.model');
const { bitrixaddLead } = require('../utility/bitrix');
const token = process.env.token
exports.addLead = async (req, res, isWebForm = false) => {

    let params = req.body;
    // let params ={
    //     consultant: 'C001',
    //     name: 'Satyajeet Joshi',
    //     email: 'patilrutvik501@gmail.com',
    //     phone: '9137898236',
    //     events: [
    //       {
    //         name: 'party',
    //         location: 'kalyan',
    //         date: '2024-09-30',
    //         timing: '6-10 pm'
    //       }
    //     ],
    //     pincode: '421102',
    //     eventSpecialsName: 'Satyajeet ',
    //     specialCode: 'Special 123',
    //     leadType: 'Regular',
    //     status: 'Pending',
    //     package: {
    //       packageName: 'silver',
    //       subname: 'test',
    //       addOns: 'test,test2',
    //       amount: '1212'
    //     }
    //   }


    try {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();

        let consultantDetails;
        if (isWebForm) {
            consultantDetails = await UserModel.find({ code: params.consultant });
            if (consultantDetails.length === 0) {
                return res.send({
                    success: false,
                    statusCode: 404,
                    message: 'Consultant not found'
                });
            }
            consultantDetails = consultantDetails[0];  // Get the first consultant from the array
        } else {
            consultantDetails = await UserModel.findById(params.consultant);
            if (!consultantDetails) {
                return res.send({
                    success: false,
                    statusCode: 404,
                    message: 'Consultant not found'
                });
            }
        }

        if (!consultantDetails) {
            const errorMsg = 'Consultant not found';
            if (isWebForm) {
                req.flash('warning', errorMsg);
                return res.redirect('/admin/addLeads');
            } else {
                return res.status(404).send({
                    success: false,
                    message: errorMsg
                });
            }
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
            const errorMsg = 'LeadID already exists.';
            if (isWebForm) {
                req.flash('warning', errorMsg);
                return res.redirect('/admin/addLeads');
            } else {
                return res.status(400).send({
                    success: false,
                    message: errorMsg
                });
            }
        }

        const formattedEvents = params.events.map(event => ({
            name: event.name || 'Unnamed Event',
            date: new Date(event.date),
            location: event.location || 'Not specified',
            timing: event.timing || 'Not specified',
        }));

        const packageData = {
            name: params.package.packageName || 'NA',
            subname: params.package.subname || 'NA',
            addonS: params.package.addOns ? params.package.addOns.split(',').map(item => item.trim()) : [],
            amount: parseFloat(params.package.amount) || 0
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

            if (isWebForm) {
                req.flash('success', 'Lead successfully added');
                return res.redirect('/admin/Leads/all');
            } else {
                return res.status(201).send({
                    success: true,
                    message: 'Lead added successfully',
                    data: lead
                });
            }
        } else {
            if (isWebForm) {
                req.flash('error', bitrixres.error);
                return res.redirect('/admin/addLeads');
            } else {
                return res.status(bitrixres.statusCode).send({
                    success: false,
                    message: bitrixres.error
                });
            }
        }
    } catch (error) {
        console.error(error);
        const errorMsg = 'Internal server error';
        if (isWebForm) {
            req.flash('error', errorMsg);
            return res.redirect('/admin/addLeads');
        } else {
            return res.status(500).send({
                success: false,
                message: errorMsg
            });
        }
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
        let AllLeads = await LeadModel.countDocuments({ consultant: consultantId, });
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
        const allConvertedLeads = await ConvertedLeadModel.find({ consultant_code: consultantId });

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
                "status": {
                    "totalAmount": totalAmount,
                    "totalCommission": totalCommission
                }
            },
            {
                "title": "Regular ALL Earnings",
                "des": "Total earnings for all regular leads",
                "status": {
                    "totalAmount": regularTotalAmount,
                    "totalCommission": regularTotalCommission
                },
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
                "status": {
                    "totalAmount": seasonalTotalAmount,
                    "totalCommission": seasonalTotalCommission
                },
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


        const leadsData = {
            allConvertedLeads,
            seasonalLeads,
            regularLeads
        };

        // Respond with the calculated data
        res.send({
            success: true,
            statusCode: 200,
            earnings: earningData,
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

exports.getconvertedleadsview = async (req, res) => {
    const leadId = req.params.leadId;
    const Leads = await ConvertedLeadModel.findById(leadId);
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

exports.getpendingLeads = async (req, res) => {
    const authHeader = req.headers.authorization;
    const authtoken = authHeader.split(" ")[1];
    const decode = jwt.verify(authtoken, token)
    const consultantId = decode.UserId;
    // const decode = req.query
    // const consultantId = decode.consultantId;
    const pendingLeads = await LeadModel.find({ consultant: consultantId, status: "Pending" }).populate("consultant");
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

