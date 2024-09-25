// Function to process lead conversion

const { calculateLeadCycle } = require("../helpers/sample");
const ConvertedLeadModel = require("../models/convertedLead.model");
const LeadModel = require("../models/lead.models");

const calculateCycleAndLeadNumber = async (data, consultantDetails) => {
    const leadCycle = calculateLeadCycle(data.leadType, new Date());
    const currentYear = new Date().getFullYear();
    const cycleKey = `${currentYear}-${leadCycle.Label}`;
    
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
    
    return { cycleKey, leadNumber, totalLeadsConverted };
  };
  
  // Function to calculate commission percentage
  const calculateCommissionPercentage = (data, leadNumber, totalLeadsConverted, cycleKey) => {
    
    console.log(data.leadType);
    
    let commissionPercentage = 2; // Default to 2%
  
    if (data.leadType === 'Seasonal') {
      // Seasonal leads commission calculation
      if (leadNumber >= 1 && leadNumber <= 3) {
        commissionPercentage = 2;
      } else if (leadNumber >= 4 && leadNumber <= 7) {
        commissionPercentage = 3;
      } else if (leadNumber > 7) {
        commissionPercentage = 4;
      }
  
      // Handle 14-day retention for 4% commission
      const currentDate = new Date();
      const leadCycle = calculateLeadCycle(data.leadType, new Date());
      const nextCycleStart = calculateNextCycleStartDate(leadCycle);
      const fourteenDaysAfterCycle = new Date(nextCycleStart);
      fourteenDaysAfterCycle.setDate(fourteenDaysAfterCycle.getDate() + 14);
  
      if (currentDate <= fourteenDaysAfterCycle && totalLeadsConverted > 0) {
        commissionPercentage = 4;
      }
    } else if (data.leadType === 'Regular') {
        console.log(leadNumber, totalLeadsConverted,data.leadType);
        
      // Regular leads commission calculation
      if (leadNumber >= 1 && leadNumber <= 4) {
        commissionPercentage = 3;
      } else if (leadNumber > 4) {
        commissionPercentage = 4;
      }
    }
  
    return commissionPercentage;
  };

const processLeadConversion = async (data, consultantDetails, leadNumber, commissionPercentage, cycleKey) => {
    console.log(leadNumber, commissionPercentage, cycleKey);
    
    const { leadID } = data;
  
    // Check if the lead already exists in converted leads
    let convertedLead = await ConvertedLeadModel.findOne({ leadID });
  
    if (!convertedLead) {
      // Lead not found in converted leads, check in pending leads
      const pendingLead = await LeadModel.findOne({ leadID });
  
      if (!pendingLead) {
        throw new Error('Pending lead not found');
      }
  
      // Update the consultant's lead cycle details
      if (data.leadType === 'Seasonal') {
        consultantDetails.convertedLeadsPerCycle.seasonal.set(cycleKey, leadNumber);
      } else {
        consultantDetails.convertedLeadsPerCycle.regular.set(cycleKey, leadNumber);
      }
  
      // Combine the logic for preparing lead data and updating invoice
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
        invoice: data.invoice || [],
        conversionDate: new Date(),
      };
  
      // When creating a new converted lead
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

  
    return convertedLead;
  };
  

  module.exports = { calculateCycleAndLeadNumber,calculateCommissionPercentage,processLeadConversion };