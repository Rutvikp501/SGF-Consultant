const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.js");
const { generateRoadmap } = require("../utility/event_roadmap_budget.js");

exports.eventroadmap = async (req, res) => {
  try {
    const params = req.body

    const roadmap = await generateRoadmap(params.startDate,params.eventDate);
console.log('====================================');
console.log(roadmap);
console.log('====================================');
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