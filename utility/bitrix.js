const axios = require('axios');
const LeadModel = require('../models/lead.models');
const ConvertedLeadModel = require('../models/convertedLead.model');
const JunkLeadModel = require('../models/junkLead.model');
const { calculateLeadCycle } = require('../helpers/sample');
const User = require('../models/user');
const currentDate = new Date();
exports.addLead = async (LeadData) => {
    try {
        const apiUrl = `https://swaptography.bitrix24.in/rest/8/t6107s6fsf94wfo9/crm.lead.add.json`;

        // Mapping the LeadData to the requestBody
        const requestBody = {
            'fields[NAME]': LeadData.name || '',
    'fields[PHONE][0][VALUE]': LeadData.phone || '',
    'fields[PHONE][0][VALUE_TYPE]': 'WORK',
    'fields[EMAIL][0][VALUE]': LeadData.email || '',
    'fields[EMAIL][0][VALUE_TYPE]': 'WORK',
    'fields[UF_CRM_1725626932463]': LeadData.consultant_code || '', // consultant_code
    'fields[UF_CRM_1725958005830]': LeadData.consultant_mobile_no || '', // consultant_mobile_no
    'fields[UF_CRM_1725957892961]': LeadData.consultant_email_id || '', // consultant_email_id
    'fields[UF_CRM_1723871068885]': LeadData.events?.[0]?.location || '', // event_location from events array
    'fields[UF_CRM_1723872311251]': LeadData.events?.[0]?.location || '', // event_location from city
    'fields[UF_CRM_1725958658829]': LeadData.leadID || '', // leadID
    'fields[UF_CRM_1723870992344]': LeadData.currentDate || '', // currentDate
    'fields[UF_CRM_1723871015696]': LeadData.name || '', // name (duplicate but required by the API)
    'fields[UF_CRM_1723871636157]': LeadData.events?.[0]?.date || '', // date from events array
    'fields[UF_CRM_1726651078700]': LeadData.events?.[0]?.name || '', // date from events array
    'fields[UF_CRM_1724929500047]': LeadData.leadType || '', // event_type (assuming it's mapped to leadType)
    'fields[UF_CRM_1726651303165]': LeadData.pincode || '', // event_type (assuming it's mapped to leadType)
    'fields[UF_CRM_1725627014795]': LeadData.events?.[0]?.date || '', // event_date from events array
    'fields[UF_CRM_1725627051950]': LeadData.eventSpecialsName || '', // eventSpecialsName
    'fields[UF_CRM_1725627132023]': LeadData.specialCode || '', // specialCode
    'fields[UF_CRM_1725961934686]': LeadData.package?.amount || '', // package amount
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
                message: 'Successfully added',
            };
        } else {
            console.error("Failed to add lead:", response.error);
            return {
                status: false,
                statusCode: response.status,
                error: response.data.error
            };
        }
    } catch (err) {
        console.error('Error adding lead:', err.message);
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

exports.getConvertedLead = async (req, res) => {
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

        // Calculate lead cycle and other relevant info
        consultantDetails.calculateLifetimeCycleNumber();
        const leadCycle = calculateLeadCycle(data.leadType, new Date());
        const currentYear = new Date().getFullYear();
        let leadNumber = 1;
        let cycleKey = `${currentYear}-${leadCycle.Label}`;

        // Update the consultant's lead cycle details
        if (data.leadType === 'Seasonal') {
            leadNumber = (consultantDetails.convertedLeadsPerCycle.seasonal.get(cycleKey) || 0) + 1;
            consultantDetails.convertedLeadsPerCycle.seasonal.set(cycleKey, leadNumber);
        } else {
            leadNumber = (consultantDetails.convertedLeadsPerCycle.regular.get(cycleKey) || 0) + 1;
            consultantDetails.convertedLeadsPerCycle.regular.set(cycleKey, leadNumber);
        }

        // Find the pending lead using the provided leadID
        const { leadID } = data;
        const pendingLead = await LeadModel.findOne({ leadID });

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
            invoice: data.invoice || [], // Handle invoice separately below
            conversionDate: new Date(),
        };

        // Ensure that the required invoice fields are present
        if (data.invoice && data.invoice.length > 0) {
            const requiredInvoiceFields = ['percentage', 'totalamount', 'paymentstatus'];
            data.invoice.forEach((inv) => {
                requiredInvoiceFields.forEach((field) => {
                    if (!inv[field]) {
                        throw new Error(`Invoice field '${field}' is required`);
                    }
                });
            });
        }

        // Check if the lead already exists in the converted leads collection
        let convertedLead = await ConvertedLeadModel.findOne({ leadID });
        if (convertedLead) {
            // Append the new invoice entries to the existing invoice array
            convertedLead.invoice = [...convertedLead.invoice, ...data.invoice];
            
            // Update other lead data as necessary
            await ConvertedLeadModel.findByIdAndUpdate(convertedLead._id, leadData, { new: true });
        } else {
            // Create a new converted lead
            convertedLead = new ConvertedLeadModel(leadData);
            await convertedLead.save();
        }

        // Save consultant details
        try {
            await consultantDetails.save();
        } catch (err) {
            throw new Error(`Error saving consultant details: ${err.message}`);
        }

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

exports.getJunkLeadsLead = async () => {
    try {
        let data = {
            consultant_code: "",
            consultant_email_id: "",
            leadID: "",
            rejectionMark:""
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
            //await LeadModel.findByIdAndDelete(LeadsId);
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

const cunvertedleaddata =     {
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