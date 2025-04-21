const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.js");
const { generateRoadmap } = require("../utility/event_roadmap_budget.js");
const LeadModel = require("../models/lead.models.js");
const { fillterdleaddataquery } = require("../query/admin.query.js");

exports.eventroadmapapi = async (req, res) => {
  try {
    const leadId = req.body.leadId || "67f4ee9b312882bc9deb1239";
    
    const leadData = await fillterdleaddataquery(leadId);
    const pdfBuffer = await generateRoadmap(leadData);
		const today = new Date().toISOString().split('T')[0];

		const fileName = `${customerName}_${customerId}_Event_Roadmap_${today}.pdf`;
		
		res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Length', pdfBuffer.length);
		res.setHeader('X-Filename', fileName);
		res.end(pdfBuffer);	

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

    return {
      pdfBuffer,
      customerName: leadData.name?.replace(/\s+/g, '_'), // remove spaces
      customerId: leadData.leadID
    };

  } catch (err) {
    console.error(err);
    throw new Error('Error generating Proforma PDF with Terms!');
  }
};

