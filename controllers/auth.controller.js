
const jwt = require('jsonwebtoken');
const token = process.env.token
const UserModel = require('../models/user.js');
const consultantModel = require('../models/consultant.model.js');
const { calculateCycle, parseDate } = require('../helpers/common.js');
const Enc_Dec = require('../helpers/Enc_Dec.js');
const validatePassword = require('../helpers/PassValidation.js');
const { SendOTP } = require("../utility/email.util.js");
const bcrypt = require("bcryptjs");
const { getuserexcel } = require('../utility/excel.util.js');
const { cloudinaryUpload } = require("../config/cloudinary.js");
const adminModel = require('../models/admin.model.js');

exports.GetAllUser = async (req, res) => {
    try {
        const User = await consultantModel.find();
        if (User.length > 0) {
            res.send({
                success: true,
                statusCode: 200,
                data: User
            })
        } else {
            res.send({
                success: false,
                statusCode: 400,
                message: "Dont have Users To Show..."
            })
        }
    } catch (error) {
        console.log(error);
    }
};

exports.GetUserData = async (req, res) => {
    try {
        // const authHeader = req.headers.authorization;
        // const authtoken = authHeader.split(" ")[1];
        // const decode = jwt.verify(authtoken,token)
        const decode = req.body
        if (decode.UserId.length < 24) {
            return res.status(400).json({
                status: false,
                statusCode: 400,
                message: 'Invalid UserId length. It must be 24 characters long.',
            });
        }
        const User = await consultantModel.findById(decode.UserId);
        if (User) {
            res.send({
                success: true,
                statusCode: 200,
                data: User
            })
        } else {
            res.send({
                success: false,
                statusCode: 500,
                message: "Dont have Users To Show..."
            })
        }
    } catch (error) {
        console.log(error);
    }
};

exports.GetSearchedUser = async (req, res, next) => {
    try {
        const params = req.body || '';
        const searchParam = params.search;
        const filter = {};

        if (searchParam) {
            filter.$or = [
                { code: { $regex: searchParam, $options: 'i' } }, // Case-insensitive search
                { name: { $regex: searchParam, $options: 'i' } },
                { email_id: { $regex: searchParam, $options: 'i' } }
            ];
        }

        const AllSearchedUser = await consultantModel.aggregate([
            { $match: filter },
            {
                $project: {
                    _id: 0, // Exclude the _id field
                    value: 1,
                    fullName: 1, // Include the concatenated name and email_id
                    code: 1,
                    name: 1,
                    mobile_no: 1,
                    email_id: 1,
                    cycle: 1,
                    consultantLifetimeCycleNumber: 1
                }
            }
        ]);
        return res.send({
            success: true,
            statusCode: 200,
            data: AllSearchedUser
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

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
                        user_code: user.code,
                        user_name: user.name,
                        email_id: user.email_id,
                        profilePhotoUrl: user.profilePhotoUrl
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

exports.Register = async (req, res) => {
    const { user_code, user_name, email_id, mobile_no, password, dateOfJoining, role } = req.body;

    // Check if Aadhaar and PAN files are provided in the request
    const aadhaarFile = req.files?.aadhaarFile;
    const panFile = req.files?.panFile;

    try {
        // Check for existing email
        const getExistingUser = await consultantModel.findOne({ email_id });
        if (getExistingUser) {
            return res.status(400).send({ success: "failed", message: "Email already exists." });
        }

        // Check for duplicate consultant code
        const duplicateCode = await consultantModel.findOne({ code: user_code });
        if (duplicateCode) {
            return res.status(400).send({ success: "failed", message: "Consultant code already exists." });
        }

        // Hash the password
        const salt = bcrypt.genSaltSync(10);
        const hashPASS = bcrypt.hashSync(password, salt);

        // Parse the date and calculate the cycle
        const date = parseDate(dateOfJoining);
        const { cycleLabel, cycleNumber } = calculateCycle(date);

        // Prepare Cloudinary upload for Aadhaar and PAN (if files exist)
        let aadhaarPhotoUrl = null;
        let panPhotoUrl = null;

        if (aadhaarFile) {
            const aadhaarUpload = await cloudinary.uploader.upload(aadhaarFile.path, {
                folder: 'aadhaar_photos',
                use_filename: true,
            });
            aadhaarPhotoUrl = aadhaarUpload.secure_url;
        }

        if (panFile) {
            const panUpload = await cloudinary.uploader.upload(panFile.path, {
                folder: 'pan_photos',
                use_filename: true,
            });
            panPhotoUrl = panUpload.secure_url;
        }

        // Create a new user
        const newUser = new consultantModel({
            code: user_code,
            name: user_name,
            email_id,
            mobile_no,
            role,
            password: hashPASS,
            dateOfJoining: date,
            currentcycle: { label: cycleLabel, number: cycleNumber },
            aadhaarPhotoUrl,  // Store Aadhaar photo URL if uploaded
            panPhotoUrl       // Store PAN photo URL if uploaded
        });

        // Save the new user
        await newUser.save();

        res.send({
            success: true,
            statusCode: 200,
            message: "User Registered Successfully"
        });

    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            statusCode: 500,
            message: "Error while registering the user"
        });
    }
};

exports.Edit = async (req, res) => {
    const { id } = request.body;
    const authHeader = req.headers.authorization;
    const authtoken = authHeader.split(" ")[1];
    const decode = jwt.verify(authtoken, token)

    try {
        const result = await consultantModel.findById(decode.UserId);
        response.send({
            success: "success",
            data: result,
        });
    } catch (error) {
        console.log(error);
    }
};

exports.Update = async (req, res) => {
    const authHeader = req.headers.authorization;
    const authtoken = authHeader.split(" ")[1];
    const decode = jwt.verify(authtoken, token)
    const consultantId = decode.UserId|| "66ab659fdec07a2c29fd9609";
    const { Password, user_name, email_id,mobile_no } = req.body;
    const getExistingUser = await consultantModel.findOne({ _id: consultantId });
    
    // const valid = validatePassword(Password);
    // if (valid) {
    //     return res.status(400).send({ message: valid[0] });
    // }

    if (getExistingUser) {
        return  res.send({
            success: true,
            statusCode: 200,
        });
    }

    try {
        const salt = bcrypt.genSaltSync(10);
        const hashPASS = bcrypt.hashSync(Password, salt);
        
        const upload = cloudinaryUpload();
        upload.fields([
            { name: 'profilephoto', maxCount: 1 },
            { name: 'panphoto', maxCount: 1 },
            { name: 'adharphoto', maxCount: 1 }
        ])(req, res, async (err) => {
            if (err) {
                return         res.send({
                    success: false,
                    statusCode: 500,
                   message: 'Error uploading images.'
                });
                   }
            
            // Check and assign uploaded image paths
            const profilePhotoUrl = req.files?.profilephoto ? req.files.profilephoto[0].path : null;
            const panPhotoUrl = req.files?.panphoto ? req.files.panphoto[0].path : null;
            const aadhaarPhotoUrl = req.files?.adharphoto ? req.files.adharphoto[0].path : null;

            // Create new user document
            const User = new consultantModel({
                Password: hashPASS,
                user_name,
                mobile_no,
                email_id,
                ...(profilePhotoUrl && { profilePhotoUrl }),
                ...(panPhotoUrl && { panPhotoUrl }),
                ...(aadhaarPhotoUrl && { aadhaarPhotoUrl })
            });

            await User.save();
            res.send({
                success: true,
                statusCode: 200,
                message: "User updated successfully"
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            statusCode: 500,
            message: 'Error updating user.',
        });
    }
};

exports.Delete = async (req, res) => {
    const authHeader = req.headers.authorization;
    const authtoken = authHeader.split(" ")[1];
    const decode = jwt.verify(authtoken, token)
    try {
        let User = await consultantModel.findById(decode.UserId);
        if (!User) {
            return res.status(404).json({ message: 'User not found' });
        }
        let delete1 = await consultantModel.findByIdAndDelete({ _id: decode.UserId });
        res.status(200).json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.Logout = async (req, res) => {
    if (req.cookies) {
        Object.keys(req.cookies).forEach((cookie) => {
            res.clearCookie(cookie);
        });
    }
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        else {
            res.send('Logged Out');
        }
    });
}

exports.forgotPassword = async (req, res) => {

    const { email_id } = req.body;
    try {
        let user = await adminModel.findOne({ email_id });
        if (!user) {
            user = await consultantModel.findOne({ email_id });
        }

        if (!user) {
            return res.send({
                success: false,
                statusCode: 500,
                message: "No user found with that email address.",
            });
        }

        // Generate OTP and set expiration
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        user.otp = otp;
        user.otpExpires = Date.now() + 3600000; // 1 hour expiration

        // Save user and handle errors
        try {
            await user.save();
        } catch (err) {
            console.error('Error saving user:', err);
            return res.send({
                success: false,
                statusCode: 500,
                message: "Error saving OTP details.",
            });
        }

        // Send the OTP via email
        const OTPMail = await SendOTP(user.email_id, otp);
        res.send({
            success: true,
            statusCode: 200,
            message: "OTP sent to your email.",
        });
    } catch (error) {
        console.error(error);
        res.send({
            success: false,
            statusCode: 500,
            message: "Error sending OTP.",
        });
    }
};


exports.resetPassword = async (req, res) => {
    const { otp, email_id, newPassword } = req.body;


    // const valid = validatePassword(Password)
    // if(valid){
    //     return res.status(400).send({message:valid[0]})
    // }
    try {
        let user = await consultantModel.findOne({
            email_id,
            otp,
            otpExpires: { $gt: Date.now() }, // Check if OTP is valid and not expired
        });

        if (!user) {
            user = await adminModel.findOne({
                email_id,
                otp,
                otpExpires: { $gt: Date.now() },
            });
        }

        if (!user) {
            return res.send({
                success: false,
                statusCode: 400,
                message: 'OTP is invalid or has expired.'
            });
        }
        const salt = bcrypt.genSaltSync(10);
        const hashPASS = bcrypt.hashSync(newPassword, salt);
        user.password = hashPASS;
        user.otp = null;
        user.otpExpires = null;

        await user.save();
        res.send({
            success: true,
            statusCode: 200,
            message: 'Password has been updated.'
        });

    } catch (error) {
        console.error(error);
        res.send({
            success: false,
            statusCode: 500,
            message: 'Error  resetting password.'
        });
    }
};

exports.getuserexcel = async (req, res, next) => {
    try {
        const { pincode, city } = req.query || '';
        const consultants = await consultantModel.find({ role: "consultant" });
        const mobile_no = 8108842956; // mobile number to filter

        const filteredConsultants = consultants.reduce((acc, consultant) => {
            if (
                (!pincode || consultant.pincode === pincode) ||
                (!mobile_no || (consultant.sales_assistan.mobile_no === mobile_no)) ||
                (!city || consultant.city === city)
            ) {
                acc.push(consultant); // Add matching consultant to the accumulator
            }
            return acc; // Return the accumulator for the next iteration
        }, []);
        // Log the filtered consultants




        // Generate Excel file buffer using the searched users
        const excelBuffer = await getuserexcel(filteredConsultants);

        // Set response headers for file download
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', 'attachment; filename=User_Data.xlsx');

        // Send the buffer as a response
        res.send(excelBuffer);

    } catch (error) {
        console.log(error);
        next(error); // Pass the error to the error handling middleware
    }
};

exports.Update = async (req, res) => {
    const { Password, user_name, email_id } = req.body;
    const getExistingUser = await consultantModel.findOne({ email_id: email_id });
    
    const valid = validatePassword(Password);
    if (valid) {
        return res.status(400).send({ message: valid[0] });
    }

    if (getExistingUser) {
        return  res.send({
            success: true,
            statusCode: 200,
            leads: leadsData,
        });
    }

    try {
        const salt = bcrypt.genSaltSync(10);
        const hashPASS = bcrypt.hashSync(Password, salt);
        
        const upload = cloudinaryUpload();
        upload.fields([
            { name: 'profilephoto', maxCount: 1 },
            { name: 'panphoto', maxCount: 1 },
            { name: 'adharphoto', maxCount: 1 }
        ])(req, res, async (err) => {
            if (err) {
                return         res.send({
                    success: false,
                    statusCode: 500,
                   message: 'Error uploading images.'
                });
                   }
            
            // Check and assign uploaded image paths
            const profilePhotoUrl = req.files?.profilephoto ? req.files.profilephoto[0].path : null;
            const panPhotoUrl = req.files?.panphoto ? req.files.panphoto[0].path : null;
            const aadhaarPhotoUrl = req.files?.adharphoto ? req.files.adharphoto[0].path : null;

            // Create new user document
            const User = new consultantModel({
                Password: hashPASS,
                user_name,
                email_id,
                ...(profilePhotoUrl && { profilePhotoUrl }),
                ...(panPhotoUrl && { panPhotoUrl }),
                ...(aadhaarPhotoUrl && { aadhaarPhotoUrl })
            });

            await User.save();
            res.send({
                success: true,
                statusCode: 200,
                message: "User updated successfully"
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).send({
            success: false,
            statusCode: 500,
            message: 'Error updating user.',
        });
    }
};
