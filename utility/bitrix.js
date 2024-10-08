const axios = require('axios');
const LeadModel = require('../models/lead.models');
const ConvertedLeadModel = require('../models/convertedLead.model');
const JunkLeadModel = require('../models/junkLead.model');
const User = require('../models/user');
const { calculateLeadCycle } = require('../helpers/sample');
const { calculateCycleAndLeadNumber, calculateCommissionPercentage, processLeadConversion } = require('./querys');

exports.bitrixaddLead = async (LeadData) => {
    
    try {
        const apiUrl = process.env.bitrixaddlead;
        //console.log(apiUrl);

        // Mapping the LeadData to the requestBody
        const requestBody = {
            'fields[UF_CRM_1723871015696]': LeadData.name || '', // BOOKING NAME whos is doing booking
            'fields[NAME]': LeadData.events?.[0]?.name || '', //event name 
            'fields[PHONE][0][VALUE]': `+91 ${LeadData.phone}` || '',
            'fields[PHONE][0][VALUE_TYPE]': 'WORK',
            'fields[EMAIL][0][VALUE]': LeadData.email || '',
            'fields[EMAIL][0][VALUE_TYPE]': 'WORK',
            // 'fields[PHONE][1][VALUE]': `+91 ${LeadData.consultant_mobile_no}` || '',
            // 'fields[PHONE][1][VALUE_TYPE]': 'OTHER',
            'fields[EMAIL][1][VALUE]': LeadData.consultant_email_id || '',
            'fields[EMAIL][1][VALUE_TYPE]': 'OTHER',
            'fields[UF_CRM_1724754601811]': LeadData.homeaddress || '', // homeaddress
            'fields[UF_CRM_1723870992344]': LeadData.currentDate || '', // currentDate
            
            'fields[UF_CRM_1725626932463]': LeadData.consultant_code || '', // consultant_code
            'fields[UF_CRM_1725958005830]': LeadData.consultant_mobile_no || '', // consultant_mobile_no
            'fields[UF_CRM_1725957892961]': LeadData.consultant_email_id || '', // consultant_email_id
            'fields[UF_CRM_1726770095504]': LeadData.consultant_name || '', // consultant_name

            'fields[UF_CRM_1725958658829]': LeadData.leadID || '', // leadID
            'fields[UF_CRM_1726162680849]': LeadData.eventSpecialsName || '', // Specials Name
            
            'fields[UF_CRM_1723872311251]': LeadData.events?.[0]?.location || '', // event_location from city
            'fields[UF_CRM_1723871068885]': LeadData.events?.[0]?.location || '', // events address 
            'fields[UF_CRM_1726651303165]': LeadData.pincode || '', // pincode
            'fields[UF_CRM_1725627014795]': LeadData.events?.[0]?.date || '', // event_date from events array
            

            'fields[UF_CRM_1724929500047]': LeadData.leadType || '', // event_type (assuming it's mapped to leadType)
            'fields[UF_CRM_1726823732500]': LeadData.events?.[0]?.name || '', // date from events array
            
            'fields[UF_CRM_1726651078700]': LeadData.events?.[0]?.name || '', //Event Name
            'fields[UF_CRM_1723871636157]': LeadData.events?.[0]?.date || '', // date from events array
            'fields[UF_CRM_1725627051950]': LeadData.eventSpecialsName || '', // eventSpecialsName
            'fields[UF_CRM_1725627132023]': LeadData.specialCode || '', // specialCode

            'fields[UF_CRM_1725961934686]': LeadData.package?.amount || '', // package amount
            'fields[UF_CRM_1724912903]': LeadData.package?.name || '', // service name / Package
        };

        const response = await axios.post(apiUrl, null, {
            params: requestBody,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        if (response.status === 200) {
            return {
                status: true,
                statusCode: 200,
                leadno: response.data.result,
                message: 'Successfully added on bitrix',
            };
        } else {
            console.error("Failed to add lead To bitrix:", response.error);
            return {
                status: false,
                statusCode: response.status,
                error: response.data.error
            };
        }
    } catch (err) {
        console.error('Error adding lead To bitrix:', err.message);
        return {
            status: false,
            statusCode: 500,
            error: err.message
        };
    }
};




exports.getAllLead = async (LeadData) => {
    // console.log("bitrixlog",LeadData.consultant_email_id);
    try {
        let data = {
            consultant_code: "",
            consultant_email_id: "",
            leadID: "",
        }
        // const response = await axios.post(`https://swaptography.bitrix24.in/rest/8/t6107s6fsf94wfo9/crm.lead.add.json?fields[NAME]=Rutvik&fields[SECOND_NAME]=&fields[LAST_NAME]=Patil&fields[PHONE][0][VALUE]=8591575854&fields[PHONE][0][VALUE_TYPE]=WORK&fields[EMAIL][0][VALUE]=test@goo.com&fields[EMAIL][0][VALUE_TYPE]=WORK `, {
        //     headers: {
        //       'Content-Type': 'application/json',
        //     }
        //   });
        let response = { status: true, statusCode: 200, data: data }
        if (response.status) {
            console.log(response.data);
            return {
                status: true,
                statusCode: 200,
                message: 'suceesfully Updated ',
            };
        } else {
            console.error("Failed to update lead:", response.error);
            return {
                status: false,
                statusCode: 500,
                error: err.message
            }
        }
        // return {
        //     status: true,
        //     statusCode: 200,
        //     message: 'Updated converted lead data ',
        // };
    } catch (err) {
        console.error('Error getting converted lead data', err.message);
        return {
            status: false,
            statusCode: 500,
            error: err.message
        };
    }
}

exports.getConvertedLead1 = async (req, res) => {
    try {
        let data = req.body;

        // Validate if the request body contains data
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                status: false,
                message: 'Request body is missing or invalid',
            });
        }

        // Find consultant details using the consultant code
        const consultantDetails = await User.findOne({ code: data.consultant });
        if (!consultantDetails) {
            return res.status(404).json({
                success: false,
                message: 'Consultant not found',
            });
        }

        // Calculate the current cycle and year
        const leadCycle = calculateLeadCycle(data.leadType, new Date());
        const currentYear = new Date().getFullYear();
        let cycleKey = `${currentYear}-${leadCycle.Label}`;

        let leadNumber = 1;
        let totalLeadsConverted = 0;

        // Check for seasonal or regular lead type
        if (data.leadType === 'Seasonal') {
            totalLeadsConverted = consultantDetails.convertedLeadsPerCycle.seasonal.get(cycleKey) || 0;
            leadNumber = totalLeadsConverted + 1;
        } else {
            totalLeadsConverted = consultantDetails.convertedLeadsPerCycle.regular.get(cycleKey) || 0;
            leadNumber = totalLeadsConverted + 1;
        }

        let commissionPercentage = 2; // Default to 2%

        if (data.leadType === 'Seasonal') {
            // Calculate commission for seasonal leads
            if (leadNumber >= 1 && leadNumber <= 3) {
                commissionPercentage = 2;
            } else if (leadNumber >= 4 && leadNumber <= 7) {
                commissionPercentage = 3;
            } else if (leadNumber > 7) {
                commissionPercentage = 4;
            }

            // Handle the 14-day retention for the 4% commission
            const currentDate = new Date();
            const nextCycleStart = calculateNextCycleStartDate(leadCycle); // This should give the start of the next cycle
            const fourteenDaysAfterCycle = new Date(nextCycleStart);
            fourteenDaysAfterCycle.setDate(fourteenDaysAfterCycle.getDate() + 14);

            if (currentDate <= fourteenDaysAfterCycle && totalLeadsConverted > 0) {
                // Retain 4% commission if a lead is converted in the first 14 days of the new cycle
                commissionPercentage = 4;
            }
        } else if (data.leadType === 'Regular') {
            // Calculate commission for regular leads
            if (leadNumber >= 1 && leadNumber <= 4) {
                commissionPercentage = 3;
            } else if (leadNumber > 4) {
                commissionPercentage = 4;
            }
        }


        // First check if the lead already exists in the converted leads collection
        const { leadID } = data;
        let convertedLead = await ConvertedLeadModel.findOne({ leadID });

        if (!convertedLead) {
            // If not found in converted leads, check in pending leads
            const pendingLead = await LeadModel.findOne({ leadID });

            // Update the consultant's lead cycle details
            if (data.leadType === 'Seasonal') {
                consultantDetails.convertedLeadsPerCycle.seasonal.set(cycleKey, leadNumber);
            } else {
                consultantDetails.convertedLeadsPerCycle.regular.set(cycleKey, leadNumber);
            }

            if (!pendingLead) {
                return res.status(404).json({
                    status: false,
                    message: 'Pending lead not found',
                });
            }

            // Prepare the lead data for conversion
            const leadData = {
                consultant: pendingLead.consultant,
                consultant_code: pendingLead.consultant_code,
                leadID: pendingLead.leadID,
                name: pendingLead.name,
                email: pendingLead.email,
                phone: pendingLead.phone,
                convertedLeadCycle: {
                    label: leadCycle.Label,
                    number: leadCycle.Number,
                    year: leadCycle.Year,
                },
                events: pendingLead.events,
                pincode: pendingLead.pincode,
                eventSpecialsName: pendingLead.eventSpecialsName || '',
                specialCode: pendingLead.specialCode || '',
                leadType: pendingLead.leadType,
                packages: pendingLead.package || {},
                invoice: data.invoice || [],
                conversionDate: new Date(),
            };

            if (data.invoice && data.invoice.length > 0) {
                data.invoice.forEach((inv) => {
                    const commission = (inv.totalamount * commissionPercentage) / 100;
                    inv.percentage = commissionPercentage + "%"; // Add the commission percentage
                    inv.commission = commission.toFixed(2);
                });
                leadData.invoice = data.invoice;
            }
            
            // Create a new converted lead
            convertedLead = new ConvertedLeadModel(leadData);
            await convertedLead.save();
            
            // Remove the lead from the pending leads collection after conversion
            await LeadModel.deleteOne({ leadID });
            } else {
                // Lead already converted, update the invoice directly
                if (data.invoice && data.invoice.length > 0) {
                    data.invoice.forEach((newInvoice) => {
                        const existingInvoiceIndex = convertedLead.invoice.findIndex(
                            (inv) => inv.name === newInvoice.name
                        );
            
                        if (existingInvoiceIndex > -1) {
                            // Update the existing invoice
                            convertedLead.invoice[existingInvoiceIndex] = {
                                ...convertedLead.invoice[existingInvoiceIndex],
                                ...newInvoice,
                            };
                            // Also set the percentage and commission
                            convertedLead.invoice[existingInvoiceIndex].percentage = commissionPercentage + "%";
                            convertedLead.invoice[existingInvoiceIndex].commission = ((newInvoice.totalamount * commissionPercentage) / 100).toFixed(2);
                        } else {
                            // Add a new invoice if it doesn't exist
                            newInvoice.percentage = commissionPercentage + "%"; // Set the commission percentage
                            newInvoice.commission = ((newInvoice.totalamount * commissionPercentage) / 100).toFixed(2); // Calculate the commission
                            convertedLead.invoice.push(newInvoice);
                        }
                    });
                }
            }
            
            // Update the converted lead with the new invoice data
            await ConvertedLeadModel.findByIdAndUpdate(
                convertedLead._id,
                { $set: { invoice: convertedLead.invoice } },
                { new: true }
            );

        // Save consultant details
        await consultantDetails.save();

        // Return success response with updated converted lead data
        return res.status(200).json({
            status: true,
            message: 'Converted lead updated successfully',
            data: convertedLead,
        });

    } catch (err) {
        console.error('Error in getConvertedLead:', err.message);
        if (err.message.includes('Invoice field')) {
            return res.status(400).json({
                status: false,
                error: err.message,
            });
        } else {
            return res.status(500).json({
                status: false,
                error: 'An internal server error occurred: ' + err.message,
            });
        }
    }
};

exports.getConvertedLead = async (req, res) => {
    try {
        let data = req.body;
        const { leadID } = data;

        // Validate the request body
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({
                status: false,
                message: 'Request body is missing or invalid',
            });
        }

        // Find consultant details using the consultant code
        const consultantDetails = await User.findOne({ code: data.consultant });
        if (!consultantDetails) {
            return res.status(404).json({
                success: false,
                message: 'Consultant not found',
            });
        }

        // Get lead type from converted or pending leads
        let leadType = (await ConvertedLeadModel.findOne({ leadID }) || await LeadModel.findOne({ leadID }))?.leadType;

        // Calculate current cycle, year, and lead number
        const { cycleKey, leadNumber, totalLeadsConverted } = await calculateCycleAndLeadNumber(data, consultantDetails, leadType);

        // Calculate commission percentage based on lead type
        const commissionPercentage = calculateCommissionPercentage(leadNumber, totalLeadsConverted, leadType);

        // Process lead conversion
        const convertedLead = await processLeadConversion(data, consultantDetails, leadNumber, commissionPercentage, cycleKey, leadType);

        // Save last commission percentage based on lead type
        if (leadType === 'Seasonal') {
            consultantDetails.lastCommissionPercentage.seasonal = commissionPercentage;
        } else {
            consultantDetails.lastCommissionPercentage.regular = commissionPercentage;
        }

        // Save consultant details
        await consultantDetails.save();

        // Return success response with updated converted lead data
        return res.status(200).json({
            status: true,
            message: 'Converted lead updated successfully',
            data: convertedLead,
        });

    } catch (err) {
        console.error('Error in getConvertedLead:', err.message);
        return res.status(500).json({
            status: false,
            error: 'An internal server error occurred: ' + err.message,
        });
    }
};




exports.getJunkLeadsLead = async () => {
    try {
        let data = {
            consultant_code: "",
            consultant_email_id: "",
            leadID: "",
            rejectionMark: ""
        }
        // const response = await axios.post(`https://swaptography.bitrix24.in/rest/8/t6107s6fsf94wfo9/crm.lead.add.json?fields[NAME]=Rutvik&fields[SECOND_NAME]=&fields[LAST_NAME]=Patil&fields[PHONE][0][VALUE]=8591575854&fields[PHONE][0][VALUE_TYPE]=WORK&fields[EMAIL][0][VALUE]=test@goo.com&fields[EMAIL][0][VALUE_TYPE]=WORK`, {
        //     headers: {
        //       'Content-Type': 'application/json',
        //     }
        // });

        let response = { status: true, statusCode: 200, data: data }
        const LeadsId = response.data.leadID;
        const { rejectionMark } = response.data;
        const lead = await LeadModel.findById(LeadsId);

        if (lead) {
            let junkLead = await JunkLeadModel.findOne({ leadID: lead.leadID });
            if (junkLead) {
                await JunkLeadModel.findByIdAndUpdate(junkLead._id, {
                    rejectionMark,
                    rejectionDate: new Date(),
                });
            } else {
                junkLead = new JunkLeadModel({

                });
                await junkLead.save();
            }
            await LeadModel.findByIdAndDelete(LeadsId);
            await LeadModel.findByIdAndUpdate(LeadsId, { status: "rejected" });

            return {
                status: true,
                statusCode: 200,
                message: 'Updated junk lead data',
            };
        }

    } catch (err) {
        console.error('Error getting junk lead data', err.message);
        return {
            status: false,
            statusCode: 500,
            error: err.message
        };
    }
}

const cunvertedleaddata = {
    "consultant": "66ab659fdec07a2c29fd9609",
    "consultant_code": "001",
    "leadID": "001-RE11L1Y24",
    "name": "RUTVIK LAXMAN PATIL",
    "email": "rutvik72patil@gmail.com",
    "phone": "09137898236",
    "pincode": "421102",
    "eventSpecialsName": "testing",
    "specialCode": "",
    "leadType": "Regular",
    "invoice": [
        {
            "name": "testing",
            "paymentstatus": "10%",
            "totalamount": "10000",
            "persentage": "2",
            "commission": "200",
        }
    ],
    "events": [
        {
            "name": "testing",
            "date": "2024-09-19T00:00:00.000Z",
            "timing": "10AM to 3PM",
            "_id": "66d9a6e955e5a2b224c7fc10"
        }
    ],
    "conversionDate": new Date("2024-09-18T07:19:15.742Z"),
} 