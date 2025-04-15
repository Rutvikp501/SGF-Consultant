const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.js");
const { generateRoadmap } = require("../utility/event_roadmap_budget.js");
const LeadModel = require("../models/lead.models.js");
const { fillterdleaddataquery } = require("../query/admin.query.js");

exports.eventroadmap = async (req, res) => {
  try {
    const leadId = req.body.leadId || "67f4ee9b312882bc9deb1239";
    
    const leadData = await fillterdleaddataquery(leadId);
    const pdfBuffer = await generateRoadmap(leadData);

    res.setHeader('Content-Disposition', 'attachment; filename=Proforma_with_Terms.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.end(pdfBuffer);
   // sendEmailWithPdf(params.lead_Id,params.booking_name,pdfBuffer)
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      statusCode: 500,
      message: 'Error generating Proforma PDF with Terms!'
    });
  }
};


exports.eventroadmap = async (params) => {
  try {
    const leadId = params.leadId || "67f4ee9b312882bc9deb1239";
    
    const leadData = await fillterdleaddataquery(leadId);
    const pdfBuffer = await generateRoadmap(leadData);

    return pdfBuffer; // just return the PDF buffer

  } catch (err) {
    console.error(err);
    throw new Error('Error generating Proforma PDF with Terms!');
  }
};
