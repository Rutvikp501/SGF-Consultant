const bcrypt = require("bcryptjs");
const UserModel = require("../models/user.js");
const adminModel = require("../models/admin.model");
const consultantModel = require("../models/consultant.model.js");
const LeadModel = require("../models/lead.models.js");
const ConvertedLeadModel = require("../models/convertedLead.model.js");
const JunkLeadModel = require("../models/junkLead.model.js");
const { calculateCycle } = require("../helpers/sample.js");
const { Consultant_Welcome, Consultant_Wellcome } = require("../utility/email.util.js");
const { cloudinaryUpload } = require("../config/cloudinary.js");
const { addinventoryquery, transformedData, consultantregistationquery, adminregistationquery, createOrUpdateProforma, addPackagesQuery } = require("../query/admin.query.js");
const inventorysModel = require("../models/inventory.model.js");
const { create_proforma } = require("../utility/pdf.js");
const { sendEmailWithPdf } = require("../helpers/email.js");
const packagesModel = require("../models/packages.model.js");

exports.Login = async (req, res) => {
  let { email_id, password } = req.body;


  try {
      const user = await consultantModel.findOne({ email_id: { $regex: new RegExp('^' + email_id + '$', 'i') } });
      if (user) {
          // Compare the entered password with the stored hashed password
          bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) {
                  throw err;
              }

              if (!isMatch) {
                  res.send({
                      success: false,
                      statusCode: 500,
                      message: `Enter Valid Password`
                  });
              } else {
                  const data = {
                      UserId: user._id,
                      role: user.role,
                      department: user.department,
                      user_name: user.name,
                      email_id: user.email_id,
                      
                  };
                  let keyToken = jwt.sign(data, token);

                  res.send({
                      success: true,
                      statusCode: 200,
                      data: keyToken
                  });
              }
          });
      } else {
          res.send({
              success: false,
              statusCode: 500,
              message: `User not found ...!`
          });
      }
  } catch (error) {
      console.log(error);
      res.send({
          success: false,
          statusCode: 500,
          message: `Invalid Credentials`
      });
  }
};


exports.getDashboard = async (req, res) => {
  const numsdata = {};
  try {
    numsdata.numAdmins = await adminModel.countDocuments();
    numsdata.numConsultants = await consultantModel.countDocuments();
    numsdata.numPendingLeads = await LeadModel.countDocuments({ status: "Pending" });
    numsdata.numConvertedLeads = await LeadModel.countDocuments({ status: "Converted" });
    numsdata.numJunkLeads = await LeadModel.countDocuments({ status: "Junk" });
    return res.send({
      success: true,
      statusCode: 200,
      data: numsdata
    })
  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Error loading dashboard...!`
    });
  }
};

exports.getAllLeads = async (req, res) => {
  try {
    const { search, sortBy, order = 'asc' } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { leadID: new RegExp(search, 'i') },
          { consultant_code: new RegExp(search, 'i') },
          { leadType: new RegExp(search, 'i') },
          { status: new RegExp(search, 'i') },
        ],
      };
    }
    const allLeads = await LeadModel.find(query)
      .populate("consultant")
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 });
    return res.send({
      success: true,
      statusCode: 200,
      allLeads, search, sortBy, order
    })
  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Error fetching leads.`
    })
  }
};

exports.getConvertedLeads = async (req, res) => {
  try {
    const convertedLeads = await LeadModel.find({ status: "Converted" }).populate("consultant");
    return res.send({
      success: true,
      statusCode: 200,
      data: convertedLeads
    })
  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Error fetching converted leads.`
    })
  }
};

exports.viewLeadDetails = async (req, res) => {
  try {
    const LeadsId = req.params.LeadsId;
    const lead = await LeadModel.findById(LeadsId).populate("consultant");
    const convertedLeads = await ConvertedLeadModel.find({ leadID: lead.leadID });
    return res.send({
      success: true,
      statusCode: 200,
      data: {
        lead, convertedLeads
      }
    })
  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Error loading lead details.`
    })
  }
};

exports.convertLead = async (req, res) => {
  try {
    const leadId = req.params.LeadsId;
    const lead = await LeadModel.findById(leadId);

    if (!lead) {
      return res.send({
        success: false,
        statusCode: 500,
        message: `Lead not found.`
      })
    }

    lead.status = "Converted";
    await lead.save();

    await new ConvertedLeadModel({
      leadID: lead.leadID,
      consultant: lead.consultant,
      details: lead.details,
    }).save();
    return res.send({
      success: true,
      statusCode: 200,
      message: `Lead converted successfully.`
    })
  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Error converting lead.`
    })
  }
};

exports.rejectLead = async (req, res) => {
  try {
    const leadId = req.params.LeadsId;
    const { rejectionMark } = req.body;

    const lead = await LeadModel.findById(leadId);

    if (!lead) {
      return res.send({
        success: false,
        statusCode: 500,
        message: `Lead not found.`
      })
    }

    lead.status = "Junk";
    await lead.save();

    await new JunkLeadModel({
      leadID: lead.leadID,
      consultant: lead.consultant,
      rejectionMark,
    }).save();
    return res.send({
      success: true,
      statusCode: 200,
      message: `Lead marked as junk successfully.`
    })
  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Error rejecting lead.`
    })
  }
};

exports.getconsultants = async (req, res) => {
  try {
    const consultant = await consultantModel.find();
    return res.send({
      success: true,
      statusCode: 200,
      data: consultant
    })
  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Error fetching consultants.`
    })
  }
};

exports.getadmins = async (req, res) => {
  try {
    const admin = await adminModel.find();
    return res.send({
      success: true,
      statusCode: 200,
      data: admin
    })
  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Error fetching admin.`
    })
  }
};

exports.addUser = async (req, res) => {

  try {
    const params = req.body;

    if (!params.role) {
      return res.send({
        success: false,
        statusCode: 201,
        message: `Role is required..`
      })
    }
    let result;
    if (params.role === "admin") {
      result = await adminregistationquery(params);
    } else if (params.role === "consultant") {
      result = await consultantregistationquery(params);
    } else {
      return res.send({
        success: false,
        statusCode: 201,
        message: `Invalid role specified.`
      })
    }

    if (result.success) {
      return res.send({
        success: true,
        statusCode: 200,
        message: result.message
      })
    } else {
      return res.send({
        success: false,
        statusCode: 500,
        message: result.message
      })
    }


  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Some error occurred on the server.`
    })
  }
};
exports.updateAdminQuery = async (params) => {
  try {
    const existingAdmin = await adminModel.findById(params.userId);

    if (!existingAdmin) {
      return {
        success: false,
        statusCode: 404,
        message: "Admin not found.",
      };
    }

    const updateFields = {
      name: params.user_name || existingAdmin.name,
      email_id: params.email_id || existingAdmin.email_id,
      mobile_no: params.mobile_no || existingAdmin.mobile_no,
      department: params.department || existingAdmin.department,
      city: params.user_city || existingAdmin.city,
      pincode: params.user_pincode || existingAdmin.pincode,
    };

    if (params.password1) {
      const salt = bcrypt.genSaltSync(10);
      updateFields.password = bcrypt.hashSync(params.password1, salt);
    }

    await adminModel.findByIdAndUpdate(params.userId, updateFields);

    return {
      success: true,
      statusCode: 200,
      message: "Admin successfully updated.",
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      statusCode: 500,
      message: "Some error occurred on the server.",
    };
  }
};


exports.getuploadPhotosPage = (req, res) => {
  const { id } = req.params;
  return res.send({
    success: true,
    statusCode: 200,
    data: id
  })
};

exports.uploadPhotosPage = async (req, res) => {
  const userId = req.params.id; // Get the userId from the URL params

  if (!userId) {
    return res.send({
      success: false,
      statusCode: 400,
      message: `No user ID found.`
    })
  }

  try {
    const upload = await cloudinaryUpload();

    upload.fields([
      { name: 'profilephoto', maxCount: 1 },
      { name: 'panphoto', maxCount: 1 },
      { name: 'adharphoto', maxCount: 1 }
    ])(req, res, async (err) => {
      if (err) {
        return res.send({
          success: false,
          statusCode: 500,
          message: `Error uploading images.`
        })
      }

      const profilePhotoUrl = req.files.profilephoto ? req.files.profilephoto[0].path : null;
      const panPhotoUrl = req.files.panphoto ? req.files.panphoto[0].path : null;
      const adharPhotoUrl = req.files.adharphoto ? req.files.adharphoto[0].path : null;
      await UserModel.findByIdAndUpdate(userId, {
        profilePhotoUrl: profilePhotoUrl,
        panPhotoUrl: panPhotoUrl,
        aadhaarPhotoUrl: adharPhotoUrl
      });
      return res.send({
        success: true,
        statusCode: 200,
        message: `User photos uploaded successfully!`
      })
    });
  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Failed to upload images.`
    })
  }
};


exports.addInventory = async (req, res) => {

  try {
    const params = req.body;
    let result;
    result = await addinventoryquery(params);
    if (result.success) {
      return res.send({
        success: true,
        statusCode: 200,
        message: result.message
      })
    } else {
      return res.send({
        success: false,
        statusCode: 500,
        message: result.message
      })
    }


  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Some error occurred on the server.`
    })
  }
};

exports.getInventory = async (req, res) => {

  try {
    const inventorys = await inventorysModel.find();
    return res.send({
      success: true,
      statusCode: 200,
      data: inventorys
    })

  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Some error occurred on the server.`
    })
  }
};
exports.addpackages = async (req, res) => {

  try {
    const params = req.body;
 
    let result;
    result = await addPackagesQuery(params);
    if (result.success) {
      return res.send({
        success: true,
        statusCode: 200,
        message: result.message
      })
    } else {
      return res.send({
        success: false,
        statusCode: 500,
        message: result.message
      })
    }


  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Some error occurred on the server.`
    })
  }
};

exports.getpackages = async (req, res) => {

  try {
    const packages = await packagesModel.find();
    return res.send({
      success: true,
      statusCode: 200,
      data: packages
    })

  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Some error occurred on the server.`
    })
  }
};

exports.addUser = async (req, res) => {

  try {
    const params = req.body;

    let result;


    if (result.success) {
      return res.send({
        success: true,
        statusCode: 200,
        message: result.message
      })
    } else {
      return res.send({
        success: false,
        statusCode: 500,
        message: result.message
      })
    }


  } catch (err) {
    console.error(err);
    return res.send({
      success: false,
      statusCode: 500,
      message: `Some error occurred on the server.`
    })
  }
};

exports.createproforma = async (req, res) => {
  try {
    const { items,subtotal, finalTotal   } = req.body;
    const params = req.body
    params.discountamnt=(subtotal-finalTotal)
    const result = await transformedData({ items });
      const serviceitems = result.serviceitems;
      let paymentstatus=[{
              isPaid:true,
              paymentDate:"29/11/2024"
          },
          {
              isPaid:false,
              paymentDate:"29/12/2024"
          },
          {
              isPaid:false,
              paymentDate:"29/01/2025"
          } ]
        
    let  data = {
      params,
      serviceitems,
      };
      data.paymentstatus=paymentstatus;
    // Call the updated create_proforma function to generate the final PDF
    const pdfBuffer = await create_proforma(data);
    //const saveproforma = await createOrUpdateProforma(data);
    // Send the PDF in the response
    res.setHeader('Content-Disposition', 'attachment; filename=Proforma_with_Terms.pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.end(pdfBuffer);
    sendEmailWithPdf(params.lead_Id,params.booking_name,pdfBuffer)
  } catch (err) {
    console.error(err);
    res.status(500).send({
      success: false,
      statusCode: 500,
      message: 'Error generating Proforma PDF with Terms!'
    });
  }
};


