const {
     calculateCycle,
     calculateLeadCycle,
     generateLeadID,
} = require("../helpers/sample");
const LeadModel = require("../models/lead.models");
const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");
const { addLead } = require("../utility/bitrix");
const ConvertedLeadModel = require("../models/convertedLead.model");
const JunkLeadModel = require("../models/junkLead.model");
const token = process.env.token;
exports.addLead = async (req, res) => {
     //
     // const authtoken = authHeader.split(" ")[1];
     // const decode = jwt.verify(authtoken,token)
     //const consultantDetails = await UserModel.findById(decode.UserId);
     //let params=req.body;
     let params = {
          consultant: "66ab659fdec07a2c29fd9609",
          name: "Rutvik",
          email: "test1@gmail.com",
          phone: "12341234",
          pincode: "421102",
          eventSpecialsName: "testing",
          specialCode: "code123",
          leadType: "Regular",
          status: "Pending",
          events: [
               {
                    name: "testing",
                    location: "mumbai",
                    date: "2024-09-17",
                    timing: "2-5",
               },
          ],
          package: {
               packageName: "package",
               subname: "subname",
               addOns: "",
               amount: 12345,
          },
     };

     try {
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear();
          const consultantDetails = await UserModel.findById(params.consultant);

          if (!consultantDetails) {
               return res.send({
                    success: false,
                    statusCode: 404,
                    message: "Consultant not found",
               });
          }
          consultantDetails.calculateLifetimeCycleNumber();
          const leadcycle = calculateLeadCycle(params.leadType, currentDate);

          let leadNumber = 1;
          let cycleKey = `${currentYear}-${leadcycle.Label}`;

          if (params.leadType === "Seasonal") {
               leadNumber =
                    (consultantDetails.leadsPerCycle.seasonal.get(cycleKey) ||
                         0) + 1;
               consultantDetails.leadsPerCycle.seasonal.set(
                    cycleKey,
                    leadNumber
               );
          } else {
               leadNumber =
                    (consultantDetails.leadsPerCycle.regular.get(cycleKey) ||
                         0) + 1;
               consultantDetails.leadsPerCycle.regular.set(
                    cycleKey,
                    leadNumber
               );
          }

          const leadID = generateLeadID(
               consultantDetails.code,
               params.leadType,
               leadcycle.Label,
               consultantDetails.consultantLifetimeCycleNumber,
               leadNumber,
               params.pincode
          );
          //console.log(leadID);

          const duplicatecode = await LeadModel.find({ leadID: leadID });

          if (duplicatecode != "") {
               return res.send({
                    success: false,
                    statusCode: 400,
                    message: "leadID already exist.",
               });
          }
          await consultantDetails.save();
          const formattedEvents = params.events.map((event) => ({
               name: event.name || "Unnamed Event",
               date: new Date(event.date), // Ensure date is a Date object
               location: event.location || "Not specified",
               timing: event.timing || "Not specified",
          }));
          const packageData = {
               name: params.package.packageName || "NA",
               subname: params.package.subname || "NA",
               addonS: params.package.addOns
                    ? params.package.addOns
                           .split(",")
                           .map((item) => item.trim())
                    : [],
               amount: parseFloat(params.package.amount) || 0,
          };
          const LeadData = {
               consultant: consultantDetails._id,
               consultant_code: consultantDetails.code,
               consultant_mobile_no: consultantDetails.mobile_no,
               consultant_email_id: consultantDetails.email_id,
               name: params.name,
               email: params.email,
               phone: params.phone,
               events: formattedEvents,
               pincode: params.pincode,
               eventSpecialsName: params.eventSpecialsName,
               specialCode: params.specialCode,
               leadType: params.leadType,
               status: params.status,
               leadID: leadID,
               cycle: {
                    label: leadcycle.Label,
                    number: leadcycle.Number,
                    year: leadcycle.year,
               },
               package: packageData,
          };
          let bitrixres = await addLead(LeadData);

          const lead = new LeadModel({
               ...LeadData,
               bitrixres: {
                    status: bitrixres.no || "",
                    message: bitrixres.message || "",
               },
          });

          //console.log(lead);

          await lead.save();

          res.send({
               success: true,
               statusCode: 201,
               message: "Lead added successfully",
               data: lead,
          });
     } catch (error) {
          console.error(error);
          res.send({
               success: false,
               statusCode: 500,
               message: "Internal server error",
          });
     }
};

exports.getAllLeads = async (req, res) => {
     let { status } = req.body;

     try {
          // const leads = await LeadModel.find();
          let leads;

          // Determine which model to query based on the status
          if (status === "pending") {
               leads = await LeadModel.find({ status: "pending" });
          } else if (status === "converted") {
               // leads = await LeadModel.find({ status: 'pending' });
               leads = await ConvertedLeadModel.find();
          } else if (status === "junk") {
               // leads = await LeadModel.find({ status: 'pending' });
               leads = await JunkLeadModel.find();
          } else {
               // If no valid status is provided, return an error
               leads = await LeadModel.find();
          }
          if (!leads.length) {
               return res.send({
                    success: false,
                    statusCode: 404,
                    message: "No leads found ",
               });
          }
          res.send({
               success: true,
               statusCode: 200,
               data: leads,
          });
     } catch (error) {
          console.error(error);
          res.send({
               success: false,
               statusCode: 500,
               message: "Internal server error",
          });
     }
};

exports.getSearchedlead = async (req, res) => {
     try {
          // const authHeader = req.headers.authorization;
          // const authtoken = authHeader.split(" ")[1];
          // const decode = jwt.verify(authtoken,token)

          const params = req.body || "";
          const searchParam = params.search;
          const filter = {};

          if (searchParam) {
               filter.$or = [
                    { consultant_code: { $regex: searchParam, $options: "i" } },
                    { leadID: { $regex: searchParam, $options: "i" } },
                    { email: { $regex: searchParam, $options: "i" } },
                    { leadType: { $regex: searchParam, $options: "i" } },
                    { pincode: { $regex: searchParam, $options: "i" } },
                    { status: { $regex: searchParam, $options: "i" } },
               ];
          }

          const allSearchedLeads = await LeadModel.aggregate([
               { $match: filter },
          ]);

          return res.send({
               success: true,
               statusCode: 200,
               data: allSearchedLeads,
          });
     } catch (error) {
          console.log(error);
          next(error);
     }
};

exports.getAdditionalData = async (req, res) => {
     const { leadId } = req.params;
     try {
          const lead = await LeadModel.findById(leadId);
          if (!lead) {
               return res.send({
                    success: false,
                    statusCode: 404,
                    message: "No lead found",
               });
          }

          const { associates } = lead;
          if (!associates) {
               return res.send({
                    success: false,
                    statusCode: 404,
                    message: "No additional data found for this lead",
               });
          }
          res.send({
               success: true,
               statusCode: 200,
               data: associates,
          });
     } catch (error) {
          console.error(error);
          res.send({
               success: false,
               statusCode: 500,
               message: "Internal server error",
          });
     }
};

exports.getLeadscount = async (req, res) => {
     const authHeader = req.headers.authorization;
     const authtoken = authHeader.split(" ")[1];
     const decode = jwt.verify(authtoken, token);
     const consultantId = decode.UserId;
     // const consultantId = "66ab659fdec07a2c29fd9609";
     const RegularLeads = {};
     const SeasonalLeads = {};
     try {
          RegularLeads.numAllLeads = await LeadModel.countDocuments({
               consultant: consultantId,
          });
          // Regular Leads Counts
          RegularLeads.numPendingLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Regular",
               status: "Pending",
          });
          RegularLeads.numAllLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Regular",
          });
          RegularLeads.numConvertedLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Regular",
               status: "Converted",
          });
          RegularLeads.numJunkLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Regular",
               status: "Junk",
          });

          // Seasonal Leads Counts
          SeasonalLeads.numPendingLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Seasonal",
               status: "Pending",
          });
          SeasonalLeads.numAllLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Seasonal",
          });
          SeasonalLeads.numConvertedLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Seasonal",
               status: "Converted",
          });
          SeasonalLeads.numJunkLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Seasonal",
               status: "Junk",
          });

          res.send({
               success: true,
               statusCode: 200,
               data: { RegularLeads, SeasonalLeads },
          });
     } catch (error) {
          console.error(error);
          res.send({
               success: false,
               statusCode: 500,
               message: "Internal server error",
          });
     }
};

exports.getDashboardData = async (req, res) => {
     const authHeader = req.headers.authorization;
     const authtoken = authHeader.split(" ")[1];
     const decode = jwt.verify(authtoken, token);
     const consultantId = decode.UserId || "66ab659fdec07a2c29fd9609";
     // const consultantId = "66ab659fdec07a2c29fd9609";
     const RegularLeads = {};
     const SeasonalLeads = {};
     try {
          let AllLeads = await LeadModel.countDocuments({
               consultant: consultantId,
          });
          // Regular Leads Counts
          RegularLeads.numPendingLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Regular",
               status: "Pending",
          });
          RegularLeads.numAllLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Regular",
          });
          RegularLeads.numConvertedLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Regular",
               status: "Converted",
          });
          RegularLeads.numJunkLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Regular",
               status: "Junk",
          });

          // Seasonal Leads Counts
          SeasonalLeads.numPendingLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Seasonal",
               status: "Pending",
          });
          SeasonalLeads.numAllLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Seasonal",
          });
          SeasonalLeads.numConvertedLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Seasonal",
               status: "Converted",
          });
          SeasonalLeads.numJunkLeads = await LeadModel.countDocuments({
               consultant: consultantId,
               leadType: "Seasonal",
               status: "Junk",
          });

          const leadsData = [
               [
                    {
                         title: "ALL Leads",
                         des: "Counts for All Leads",
                         status: AllLeads,
                    },
                    {
                         title: "Regular ALL Leads ",
                         des: "Counts for All Leads",
                         status: RegularLeads.numAllLeads,
                         subList: [
                              {
                                   title: "Regular Pending Leads",
                                   des: "Counts for Pending Leads",
                                   status: RegularLeads.numPendingLeads,
                              },
                              {
                                   title: "Regular Converted Leads",
                                   des: "Counts for Converted Leads",
                                   status: RegularLeads.numConvertedLeads,
                              },
                              {
                                   title: "Regular Junk Leads",
                                   des: "Counts for Junk Leads",
                                   status: RegularLeads.numJunkLeads,
                              },
                         ],
                    },
                    {
                         title: "Seasonal ALL Leads",
                         des: "Counts for All Leads",
                         status: SeasonalLeads.numAllLeads,
                         subList: [
                              {
                                   title: "Seasonal Pending Leads",
                                   des: "Counts for Pending Leads",
                                   status: SeasonalLeads.numPendingLeads,
                              },
                              {
                                   title: "Seasonal Converted Leads",
                                   des: "Counts for Converted Leads",
                                   status: SeasonalLeads.numConvertedLeads,
                              },
                              {
                                   title: "Seasonal Junk Leads",
                                   des: "Counts for Junk Leads",
                                   status: SeasonalLeads.numJunkLeads,
                              },
                         ],
                    },
               ],
          ];
          res.send({
               success: true,
               statusCode: 200,
               data: leadsData,
          });
     } catch (error) {
          console.error(error);
          res.send({
               success: false,
               statusCode: 500,
               message: "Internal server error",
          });
     }
};

exports.getconvertedLeads = async (req, res) => {
     const authHeader = req.headers.authorization;
     const authtoken = authHeader.split(" ")[1];
     const decode = jwt.verify(authtoken, token);
     //  const decode = req.body
     const consultantId = decode.UserId;
     const ConvertedLeads = await LeadModel.find({
          consultant: consultantId,
          status: "Converted",
     }).populate("consultant");
     try {
          res.send({
               success: true,
               statusCode: 200,
               data: ConvertedLeads,
          });
     } catch (error) {
          console.error(error);
          res.send({
               success: false,
               statusCode: 500,
               message: "Internal server error",
          });
     }
};

exports.getpendingLeads = async (req, res) => {
     const authHeader = req.headers.authorization;
     const authtoken = authHeader.split(" ")[1];
     const decode = jwt.verify(authtoken, token);
     const consultantId = decode.UserId;
     // const decode = req.body
     // const consultantId = decode.UserId;
     const pendingLeads = await LeadModel.find({
          consultant: consultantId,
          status: "Pending",
     }).populate("consultant");
     try {
          res.send({
               success: true,
               statusCode: 200,
               data: pendingLeads,
          });
     } catch (error) {
          console.error(error);
          res.send({
               success: false,
               statusCode: 500,
               message: "Internal server error",
          });
     }
};

exports.getleadsview = async (req, res) => {
     const leadId = req.params.leadId;
     const Leads = await LeadModel.findById(leadId).populate("consultant");
     try {
          res.send({
               success: true,
               statusCode: 200,
               data: Leads,
          });
     } catch (error) {
          console.error(error);
          res.send({
               success: false,
               statusCode: 500,
               message: "Internal server error",
          });
     }
};
