// Function to process lead conversion

const { calculateLeadCycle } = require("../helpers/sample");
const ConvertedLeadModel = require("../models/convertedLead.model");
const LeadModel = require("../models/lead.models");
const axios = require('axios');
const Bitrixget = process.env.BITRIX_GET_DATA;

exports.calculateCycleAndLeadNumber = async (data, consultantDetails, leadType) => {
    const leadCycle = calculateLeadCycle(leadType, new Date());
    const currentYear = new Date().getFullYear();
    const cycleKey = `${currentYear}-${leadCycle.Label}`;

    let leadNumber = 1;
    let totalLeadsConverted = 0;

    // Check for seasonal or regular lead type
    if (leadType === 'Seasonal') {
        totalLeadsConverted = consultantDetails.convertedLeadsPerCycle.seasonal.get(cycleKey) || 0;
        leadNumber = totalLeadsConverted + 1;
    } else {
        totalLeadsConverted = consultantDetails.convertedLeadsPerCycle.regular.get(cycleKey) || 0;
        leadNumber = totalLeadsConverted + 1;
    }

    return { cycleKey, leadNumber, totalLeadsConverted };
};
// Commission Calculation
exports.calculateCommissionPercentage = (leadNumber, totalLeadsConverted, leadType) => {
    let commissionPercentage = 2; // Default 2% for all leads

    if (leadType === 'Seasonal') {
        // Seasonal lead commission calculation
        if (leadNumber >= 1 && leadNumber <= 3) {
            commissionPercentage = 2;
        } else if (leadNumber >= 4 && leadNumber <= 7) {
            commissionPercentage = 3.5;
        } else if (leadNumber > 7) {
            commissionPercentage = 4.5;
        }

        // Handle 14-day retention for higher commission
        const currentDate = new Date();
        const nextCycleStart = calculateNextCycleStartDate(calculateLeadCycle(leadType));
        const fourteenDaysAfterCycle = new Date(nextCycleStart);
        fourteenDaysAfterCycle.setDate(fourteenDaysAfterCycle.getDate() + 14);

        if (currentDate <= fourteenDaysAfterCycle && totalLeadsConverted > 0) {
            commissionPercentage = 4.5;
        }

    } else if (leadType === 'Regular') {
        // Regular lead commission calculation
        if (leadNumber >= 1 && leadNumber <= 3) {
            commissionPercentage = 4;
        } else if (leadNumber > 3) {
            commissionPercentage = 7;
        }
    }
    return commissionPercentage;
};
// Lead Conversion Process
exports.processLeadConversion = async (data, consultantDetails, leadNumber, commissionPercentage, cycleKey, leadType,invoice) => {
    const { leadID } = data;

    // Check if the lead already exists in converted leads
    let convertedLead = await ConvertedLeadModel.findOne({ leadID });

    if (!convertedLead) {
        // Lead not found in converted leads, check in pending leads
        const pendingLead = await LeadModel.findOne({ leadID });

        if (!pendingLead) {
            throw new Error('Pending lead not found');
        }

        if (typeof consultantDetails.convertedLeadsPerCycle !== 'object' || consultantDetails.convertedLeadsPerCycle === null) {
            consultantDetails.convertedLeadsPerCycle = {
                seasonal: new Map(),  // Initialize as a Map
                regular: new Map()     // Initialize as a Map
            };
        }

        // Initialize seasonal and regular as empty Maps if they don't exist
        if (!(consultantDetails.convertedLeadsPerCycle.seasonal instanceof Map)) {
            consultantDetails.convertedLeadsPerCycle.seasonal = new Map();
        }

        if (!(consultantDetails.convertedLeadsPerCycle.regular instanceof Map)) {
            consultantDetails.convertedLeadsPerCycle.regular = new Map();
        }

        // Update the consultant's lead cycle details
        if (leadType === 'Seasonal') {
            consultantDetails.convertedLeadsPerCycle.seasonal.set(cycleKey, leadNumber);
        } else {
            consultantDetails.convertedLeadsPerCycle.regular.set(cycleKey, leadNumber);
        }

        // Prepare lead data for conversion
        const leadData = {
            consultant: pendingLead.consultant,
            consultant_code: pendingLead.consultant_code,
            leadID: pendingLead.leadID,
            name: pendingLead.name,
            email: pendingLead.email,
            phone: pendingLead.phone,
            convertedLeadCycle: {
                label: cycleKey,
                number: leadNumber,
                year: new Date().getFullYear(),
            },
            events: pendingLead.events,
            pincode: pendingLead.pincode,
            eventSpecialsName: pendingLead.eventSpecialsName || '',
            specialCode: pendingLead.specialCode || '',
            leadType: pendingLead.leadType,
            packages: pendingLead.package || {},
            invoice: invoice || [],
            conversionDate: new Date(),
        };

        // Add commission calculation for invoices
        if (invoice && invoice.length > 0) {
            invoice.forEach((inv) => {
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
        // If the lead is already converted, update the invoice
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
                    convertedLead.invoice[existingInvoiceIndex].percentage = commissionPercentage + "%";
                    convertedLead.invoice[existingInvoiceIndex].commission = ((newInvoice.totalamount * commissionPercentage) / 100).toFixed(2);
                } else {
                    // Add a new invoice if it doesn't exist
                    newInvoice.percentage = commissionPercentage + "%";
                    newInvoice.commission = ((newInvoice.totalamount * commissionPercentage) / 100).toFixed(2);
                    convertedLead.invoice.push(newInvoice);
                }
            });
        }

        // Update the converted lead with the new invoice data
        await ConvertedLeadModel.findByIdAndUpdate(
            convertedLead._id,
            { $set: { invoice: convertedLead.invoice } },
            { new: true }
        );
    }

    return convertedLead;
};

exports.getallLead = async () => {
    console.log("getallstage");
    let ID = "10"
    try {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${Bitrixget}${ID}`,
            headers: {
                'Cookie': 'qmb=0.'
            }
        };

        // Await the axios request
        const response = await axios.request(config);
        // Return successful response
        return {
            statusCode: 200,
            status: true,
            message: "success",
            data: response.data
        };

    } catch (err) {
        // Log the error message for debugging
        console.error('Error lead stage:', err.message);

        // Return error response
        return {
            status: false,
            statusCode: 500,
            error: err.message
        };
    }
};
exports.getLeadstage = async () => {
    console.log("getLeadstage");
    let ID = "10"
    try {
        const config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${Bitrixget}${ID}`,
            headers: {
                'Cookie': 'qmb=0.'
            }
        };

        // Await the axios request
        const response = await axios.request(config);
        // Return successful response
        return {
            statusCode: 200,
            status: true,
            message: "success",
            data: response.data
        };

    } catch (err) {
        // Log the error message for debugging
        console.error('Error lead stage:', err.message);

        // Return error response
        return {
            status: false,
            statusCode: 500,
            error: err.message
        };
    }
};
exports.getLeadquotation = async () => {
    try {

        const response = await axios.post(Bitrixget, null, {
            params: requestBody,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });
        return {
            statusCode: 200,
            status: true,
            message: "success",
            data: response.data
        };

    } catch (err) {
        console.error('Error lead stage', err.message);
        return {
            status: false,
            statusCode: 500,
            error: err.message
        };
    }
}




const calculateNextCycleStartDate = (leadCycle) => {
    const { startDate } = leadCycle; // Assuming the cycle object has a startDate

    // Assuming lead cycles last for 2 months (adjust this as per your actual cycle length)
    let nextCycleStart = new Date(startDate);
    nextCycleStart.setMonth(nextCycleStart.getMonth() + 2); // Move to the next cycle (add 2 months)

    return nextCycleStart;
};
