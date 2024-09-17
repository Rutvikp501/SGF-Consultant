const axios = require('axios');
const LeadModel = require('../models/lead.models');
const ConvertedLeadModel = require('../models/convertedLead.model');
const JunkLeadModel = require('../models/junkLead.model');

exports.addLead = async (LeadData) => {
   // console.log(LeadData);
    
    try {
        const apiUrl = `https://swaptography.bitrix24.in/rest/8/t6107s6fsf94wfo9/crm.lead.add.json`;
        const requestBody = {
            'fields[NAME]': LeadData.name || '',
            'fields[PHONE][0][VALUE]': LeadData.phone || '',
            'fields[PHONE][0][VALUE_TYPE]': 'WORK',
            'fields[EMAIL][0][VALUE]': LeadData.email || '',
            'fields[EMAIL][0][VALUE_TYPE]': 'WORK',
            'fields[UF_CRM_1725626932463]': LeadData.consultant_code || '',
            'fields[UF_CRM_1725958005830]': LeadData.consultant_mobile_no || '',
            'fields[UF_CRM_1725957892961]': LeadData.consultant_email_id || '',
            'fields[UF_CRM_1723871068885]': LeadData.event_location || '',
            'fields[UF_CRM_1725958658829]': LeadData.leadID || '',
            'fields[UF_CRM_1723870992344]': LeadData.currentDate || '',
            'fields[UF_CRM_1723871015696]': LeadData.booking_name || '',
            'fields[UF_CRM_1723871636157]': LeadData.formattedEvents.date || '',
            'fields[UF_CRM_1724929500047]': LeadData.event_type || '',
            'fields[UF_CRM_1725627014795]': LeadData.event_date || '',
            'fields[UF_CRM_1725627051950]': LeadData.eventSpecialsName || '',
            'fields[UF_CRM_1725627132023]': LeadData.specialCode || '',
            'fields[UF_CRM_1725961934686]': LeadData.packageData.amount || ''
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
               // no: response.result,
                message: 'Successfully added',
            };
        } else {
            console.error("Failed to add lead:", response.data.error);
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

exports.getConvertedLead = async () => {
    try {
        let data = {
            consultant_code: "",
            consultant_email_id: "",
            leadID: "",
        }
        // const response = await axios.post(`https://swaptography.bitrix24.in/rest/8/t6107s6fsf94wfo9/crm.lead.add.json?fields[NAME]=Rutvik&fields[SECOND_NAME]=&fields[LAST_NAME]=Patil&fields[PHONE][0][VALUE]=8591575854&fields[PHONE][0][VALUE_TYPE]=WORK&fields[EMAIL][0][VALUE]=test@goo.com&fields[EMAIL][0][VALUE_TYPE]=WORK`, {
        //     headers: {
        //       'Content-Type': 'application/json',
        //     }
        // });

        let response = { status: true, statusCode: 200, data: data }
        if (response.status) {
            console.log(response.data);

            const { leadID } = data;

            let convertedLead = await ConvertedLeadModel.findOne({ leadID });
            if (convertedLead) {
                await ConvertedLeadModel.findByIdAndUpdate(convertedLead._id, data);
            } else {
                convertedLead = new ConvertedLeadModel({
                    
                });
                await convertedLead.save();
            }
            //await LeadModel.findByIdAndDelete(LeadsId);
            await LeadModel.findOneAndUpdate({ leadID }, { status: "Converted" });

            return {
                status: true,
                statusCode: 200,
                message: 'Updated converted lead data ',
            };
        }

    } catch (err) {
        console.error('Error getting converted lead data', err.message);
        return {
            status: false,
            statusCode: 500,
            error: err.message
        };
    }
}

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