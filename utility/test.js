
{
    UF_CRM_1725626932463: "",//consultant_code
    UF_CRM_1725958005830: "",//consultant_mobile_no
    UF_CRM_1725957892961: "",//consultant_email_id
    name: "",//event name
    email: "",//email
    phone: "",//phone
    UF_CRM_1723871068885: "",//event_location
    UF_CRM_1725958658829: "",//lead_id
    UF_CRM_1723870992344: "",// Date of issue
    UF_CRM_1723871015696: "",// Booking Name  
    UF_CRM_1723871636157: "",// Date and time of event 
    UF_CRM_1724929500047: "",// Event Type 
    UF_CRM_1726651078700: "",// Event name 
    UF_CRM_1725627014795: "",// eventDate 
    UF_CRM_1725627051950: "",//eventSpecialsName 
    UF_CRM_1725627132023: "",//specialCode
    UF_CRM_1725961934686: "",// Package amount
    UF_CRM_1723870968846: "",// Equiry No
    UF_CRM_1723872311251: "",// City
    UF_CRM_1726651303165: "",// Pincode
}

//   let params = {
//     consultant: '66ab659fdec07a2c29fd9609',
//     name: 'Rutvik',
//     email: 'test1@gmail.com',
//     phone: '12341234',
//     pincode: '421102',
//     eventSpecialsName: 'testing',
//     specialCode: 'code123',
//     leadType: 'Regular',
//     status: 'Pending',
//     events: [
//       {
//         name: 'testing',
//         location: 'mumbai',
//         date: '2024-09-17',
//         timing: '2-5'
//       }
//     ],
//     package: {
//       packageName: 'package',
//       subname: 'subname',
//       addOns: '',
//       amount: 12345
//     }
//   }

const LeadData ={
    consultant: new ObjectId("66ab659fdec07a2c29fd9609"),
    consultant_code: '001',
    consultant_mobile_no: 1111111111,
    consultant_email_id: 'testing12@gmail.com',
    name: 'laxman',
    email: 'Laxman@gmail.com',
    phone: '8097282157',
    events: [
      {
        name: 'Birthday',
        date: 2024-09-18T00:00:00.000Z,
        location: 'ambivali',
        timing: '5 pm to 10 pm'
      }
    ],
    pincode: '421102',
    eventSpecialsName: 'Anita',
    specialCode: '1234',
    leadType: 'Regular',
    status: 'Pending',
    leadID: '001-RI11L8Y24',
    cycle: { label: 'I', number: 9, year: undefined },
    currentDate: 2024-09-18T07:19:15.742Z,
    package: { name: 'premium', subname: 'NA', addonS: [ 'test' ], amount: 0 }
  }
  const requestBody= {
    'fields[NAME]': 'laxman',
    'fields[PHONE][0][VALUE]': '8097282157',
    'fields[PHONE][0][VALUE_TYPE]': 'WORK',
    'fields[EMAIL][0][VALUE]': 'Laxman@gmail.com',
    'fields[EMAIL][0][VALUE_TYPE]': 'WORK',
    'fields[UF_CRM_1725626932463]': '001',
    'fields[UF_CRM_1725958005830]': 1111111111,
    'fields[UF_CRM_1725957892961]': 'testing12@gmail.com',
    'fields[UF_CRM_1723871068885]': 'ambivali',
    'fields[UF_CRM_1725958658829]': '001-RI11L8Y24',
    'fields[UF_CRM_1723870992344]': 2024-09-18T07:19:15.742Z,
    'fields[UF_CRM_1723871015696]': 'laxman',
    'fields[UF_CRM_1723871636157]': 2024-09-18T00:00:00.000Z,
    'fields[UF_CRM_1724929500047]': 'Regular',
    'fields[UF_CRM_1725627014795]': 2024-09-18T00:00:00.000Z,
    'fields[UF_CRM_1725627051950]': 'Anita',
    'fields[UF_CRM_1725627132023]': '1234',
    'fields[UF_CRM_1725961934686]': ''
  }

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
    'fields[UF_CRM_1723870968846]': LeadData.leadID || '', // Equiry No
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
        console.log(consultantDetails);

        // Calculate lead cycle and other relevant info
        consultantDetails.calculateLifetimeCycleNumber();
        const leadCycle = calculateLeadCycle(data.leadType, new Date());
        const currentYear = new Date().getFullYear();
        let leadNumber = 1;
        let cycleKey = `${currentYear}-${leadCycle.Label}`;
        let commissionPercentage = 2; // Default commission

        // First check if the lead already exists in the converted leads collection
        const { leadID } = data;
        let convertedLead = await ConvertedLeadModel.findOne({ leadID });

        if (!convertedLead) {
            // If not found in converted leads, check in pending leads
            const pendingLead = await LeadModel.findOne({ leadID });

            // Update the consultant's lead cycle details
            let totalConvertedLeadsInCycle;
            let isSeasonal = data.leadType === 'Seasonal';
            let convertedLeadsPerCycle = consultantDetails.convertedLeadsPerCycle[isSeasonal ? 'seasonal' : 'regular'];

            totalConvertedLeadsInCycle = convertedLeadsPerCycle.get(cycleKey) || 0;

            // Calculate commission percentage
            if (totalConvertedLeadsInCycle >= 1 && totalConvertedLeadsInCycle <= 3) {
                commissionPercentage = 2;
            } else if (totalConvertedLeadsInCycle >= 4 && totalConvertedLeadsInCycle <= 7) {
                commissionPercentage = 3;
            } else if (totalConvertedLeadsInCycle > 7) {
                commissionPercentage = 4;
            }

            // Add the 14-day retention logic for seasonal leads
            if (isSeasonal && leadCycle.daysIntoNewCycle <= 14) {
                let previousCycleKey = `${currentYear - 1}-${leadCycle.Label}`;
                let previousCycleLeads = convertedLeadsPerCycle.get(previousCycleKey) || 0;
                if (previousCycleLeads > 7 && totalConvertedLeadsInCycle >= 1) {
                    commissionPercentage = 4; // Retain 4% if converted 1+ leads in the first 14 days
                }
            }

            // Increment the converted lead count for this cycle
            totalConvertedLeadsInCycle++;
            convertedLeadsPerCycle.set(cycleKey, totalConvertedLeadsInCycle);

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
                commission: `${commissionPercentage}%`, // Add commission
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

            // Create a new converted lead
            convertedLead = new ConvertedLeadModel(leadData);
            await convertedLead.save();

            // Remove the lead from the pending leads collection after conversion
            await LeadModel.deleteOne({ leadID });
        } else {
            // If the lead is already converted, update the invoice
            if (data.invoice && data.invoice.length > 0) {
                data.invoice.forEach(newInvoice => {
                    const existingInvoiceIndex = convertedLead.invoice.findIndex(
                        inv => inv.name === newInvoice.name || inv.number === newInvoice.number
                    );

                    if (existingInvoiceIndex > -1) {
                        // If an invoice with the same name or number exists, update it
                        convertedLead.invoice[existingInvoiceIndex] = { ...convertedLead.invoice[existingInvoiceIndex], ...newInvoice };
                    } else {
                        // If the invoice doesn't exist, add it
                        convertedLead.invoice.push(newInvoice);
                    }
                });
            }

            // Update other lead data if necessary
            await ConvertedLeadModel.findByIdAndUpdate(
                convertedLead._id,
                { $set: { invoice: convertedLead.invoice } },
                { new: true }
            );
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
