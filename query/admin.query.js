
const adminModel = require("../models/admin.model");
const consultantModel = require("../models/consultant.model.js");
const bcrypt = require("bcryptjs");
const { cloudinaryUpload } = require("../config/cloudinary.js");
const { Consultant_Wellcome } = require("../utility/email.util.js");
const inventorysModel = require("../models/inventory.model.js");
const { calculateCycle } = require("../helpers/sample.js");

exports.adminregistationquery = async (params) => {
    try {
        const existingAdmin = await adminModel.findOne({ email_id: params.email_id });

        if (existingAdmin) {
            return {
                success: false,
                statusCode: 409,
                message: "This Email is already registered. Please try another email.",
            };
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(params.password1, salt);

        const newAdmin = new adminModel({
            name: params.user_name,
            email_id: params.email_id,
            mobile_no: params.mobile_no || null,
            role: params.role,
            password: hash,
            department: params.department,
            city: params.user_city || null,
            pincode: params.user_pincode || null,
        });

        await newAdmin.save();

        return {
            success: true,
            statusCode: 200,
            message: "Admin successfully added.",
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

exports.consultantregistationquery = async (params) => {
    try {
        const existingUser = await consultantModel.findOne({ email_id: params.email_id });
        const duplicateCode = await consultantModel.findOne({ code: params.user_code });

        if (existingUser) {
            return {
                success: false,
                statusCode: 401,
                message: "This Email is already registered. Please try another email.",
            };
        }

        if (duplicateCode) {
            return {
                success: false,
                statusCode: 409,
                message: "User code already exists.",
            };
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(params.password1, salt);

        const date = new Date(params.dateOfJoining);
        const { regular, seasonal } = calculateCycle(date);

        const newConsultant = new consultantModel({
            code: params.user_code,
            name: params.user_name,
            email_id: params.email_id,
            mobile_no: params.mobile_no,
            role: params.role,
            password: hash,
            dateOfJoining: date,
            city: params.user_city,
            pincode: params.user_pincode,
            sales_assistan: {
                name: params.sales_assistan_name || null,
                mobile_no: params.sales_assistan_mobile_no || null,
            },
            user_bank_details: {
                bank_name: params.bank_name || null,
                account_number: params.account_number || null,
                ifsc_code: params.ifsc_code || null,
                branch_name: params.branch_name || null,
            },
            currentcycle: {
                regular: { cycleLabel: regular.cycleLabel, cycleNumber: regular.cycleNumber },
                seasonal: { cycleLabel: seasonal.cycleLabel, cycleNumber: seasonal.cycleNumber },
            },
        });

        await newConsultant.save();
        await Consultant_Wellcome(newConsultant, params.password1);

        return {
            success: true,
            statusCode: 200,
            message: "Consultant successfully added.",
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

exports.updateAdminQuery = async (params,id) => {
    try {
      const existingAdmin = await adminModel.findById(id);
  
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
  
      await adminModel.findByIdAndUpdate(id, updateFields);
  
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

  exports.updateConsultantQuery = async (params,id) => {
    
    try {
      const existingConsultant = await consultantModel.findById(id);
  
      if (!existingConsultant) {
        return {
          success: false,
          statusCode: 404,
          message: "Consultant not found.",
        };
      }
  
      const duplicateEmail = await consultantModel.findOne({
        email_id: params.email_id,
        _id: { $ne: params.userId },
      });
  
      if (duplicateEmail) {
        return {
          success: false,
          statusCode: 409,
          message: "This Email is already registered. Please try another email.",
        };
      }
  
      const updateFields = {
        name: params.user_name || existingConsultant.name,
        email_id: params.email_id || existingConsultant.email_id,
        mobile_no: params.mobile_no || existingConsultant.mobile_no,
        city: params.user_city || existingConsultant.city,
        pincode: params.user_pincode || existingConsultant.pincode,
        sales_assistan: {
          name: params.sales_assistan_name || existingConsultant.sales_assistan.name||null,
          mobile_no: params.sales_assistan_mobile_no || existingConsultant.sales_assistan.mobile_no||null,
        },
        user_bank_details: {
          bank_name: params.bank_name || existingConsultant.user_bank_details.bank_name||null,
          account_number: params.account_number || existingConsultant.user_bank_details.account_number||null,
          ifsc_code: params.ifsc_code || existingConsultant.user_bank_details.ifsc_code||null,
          branch_name: params.branch_name || existingConsultant.user_bank_details.branch_name||null,
        },
      };
  
      await consultantModel.findByIdAndUpdate(id, updateFields);
  
      return {
        success: true,
        statusCode: 200,
        message: "Consultant successfully updated.",
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
  
    

exports.updateUserPhotos = async (userId, photoUrls) => {
    try {
        const { profilePhotoUrl, panPhotoUrl, adharPhotoUrl } = photoUrls;

        const user = await consultantModel.findByIdAndUpdate(userId, {
            profilePhotoUrl,
            panPhotoUrl,
            aadhaarPhotoUrl: adharPhotoUrl,
        });

        if (!user) {
            return {
                success: false,
                message: "User not found. Failed to update photos.",
            };
        }

        return { success: true, message: "Photos updated successfully." };
    } catch (err) {
        console.error(err);
        return { success: false, message: "Error occurred while updating photos." };
    }
};

exports.addinventoryquery = async (params) => {
    try {
        const existinginventory = await inventorysModel.findOne({ name: params.name });

        if (existinginventory) {
            return {
                success: false,
                statusCode: 409,
                message: `${params.name} Alredy exists`,
            };
        }

        const newinventory = new inventorysModel({
            type: params.inventory_type,
            name: params.inventory_name,
            subname: params.subname || null,
            detailed_description: params.detailed_description,
            retail_price: params.retail_price,
            PhotoUrl: params.PhotoUrl || null,
        });

        await newinventory.save();

        return {
            success: true,
            statusCode: 200,
            message: "Inventorys successfully added.",
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

exports.transformedData = async (params) => {
    const serviceitems = await Promise.all(
      params.items.map(async (item) => {
        const inventory = await inventorysModel.findOne({ name: item.name });
        return {
          _id: inventory?._id,
          name: inventory?.name,
          subname: inventory?.subname,
          detailed_description: inventory?.detailed_description,
          retail_price: inventory?.retail_price,
          PhotoUrl: inventory?.PhotoUrl,
          quantity: item.quantity,
          date: item.date,
        };
      })
    );
    return {
        serviceitems,
    };
  };