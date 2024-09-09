
const jwt = require('jsonwebtoken');
const token = process.env.token
const UserModel = require('../models/user');
const { calculateCycle, parseDate } = require('../helpers/sample');
const Enc_Dec = require('../helpers/Enc_Dec');
const validatePassword = require('../helpers/PassValidation');
const { SendOTP } = require('../helpers/email');
const bcrypt = require("bcryptjs");

exports.GetAllUser = async (req, res) => {
    try {
        const User  = await UserModel.find();
        if (User.length>0){
        res.send({
            success: true,
            statusCode: 200,
            data:User
        })
        }else{
        res.send({
            success: false,
            statusCode: 200,
            message:"Dont have Users To Show..."
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
        const User  =await UserModel.findById(decode.UserId);
        if (User){
        res.send({
            success: true,
            statusCode: 200,
            data:User
        })
        }else{
        res.send({
            success: false,
            statusCode: 200,
            message:"Dont have Users To Show..."
        })
        }
    } catch (error) {
        console.log(error);
    }
};
exports.GetSearchedUser = async (req, res,next) => {
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

        const AllSearchedUser = await UserModel.aggregate([
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
            success: false,
            statusCode: 500,
            data:AllSearchedUser
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};

exports.Login = async (req, res) => {
    let { email_id, password } = req.body;

    try {
        const user = await UserModel.findOne({ email_id });
        
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
                    // Generate JWT token
                    
                    const data = {
                        UserId: user._id,
                        role: user.role,
                        user_code: user.code,
                        user_name: user.name,
                        email_id: user.email_id
                    };
                    let keyToken = jwt.sign( data, token); 
                    
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
    const {user_code, user_name , email_id ,mobile_no,password,dateOfJoining ,role }=req.body
    
    const getExistingUser = await UserModel.find({ email_id: email_id });  
    const duplicatecode = await UserModel.find({ code: user_code });  
    // const valid = validatePassword(password)
    // if(valid){
    //     return res.status(400).send({message:valid[0]})
    // }
         if(duplicatecode!=""){
         return res.status(400).send({success: "failed", message: "Consultant code already exist." })
     }
    try{
        if (getExistingUser != "") {
            return res.send({ success: "failed", message: "Email already exist." });
          }else{
            const salt = bcrypt.genSaltSync(10);
            const hashPASS = bcrypt.hashSync(password, salt);
            const date = parseDate(dateOfJoining);
            const {cycleLabel,cycleNumber} = calculateCycle(date);
                const User = new UserModel({
                    code:user_code,
                    name:user_name,
                    email_id:email_id,
                    mobile_no:mobile_no,
                    role:role,
                    password:hashPASS,
                    dateOfJoining: date,
                    currentcycle: {label: cycleLabel,number:cycleNumber},
                })
                await User.save();
                res.send({
                    success: true,
                    statusCode: 200,
                    message:"User Registered Successfully"
                })       
            }
        
    
    }catch(err){
        console.log(err);
        res.send({
            success: false,
            statusCode: 500,
            message:"Error"
        });
    }
};

exports.Edit = async (req, res) => {
    const { id } = request.body;
    const authHeader = req.headers.authorization;
    const authtoken = authHeader.split(" ")[1];
    const decode = jwt.verify(authtoken,token)
    console.log(decode.UserId);
    
    try {
      const result = await UserModel.findById(decode.UserId);
      response.send({
        success: "success",
        data: result,
      });
    } catch (error) {
      console.log(error);
    }
};

exports.Update = async (req, res) => {
    const {Password, user_name , email_id }=req.body
    const getExistingUser = await UserModel.find({ email_id: email_id });   
    // console.log(getExistingUser);
    const valid = validatePassword(Password)
    if(valid){
        return res.status(400).send({message:valid[0]})
    }
    try{
       
        if (getExistingUser != "") {
            return res.send({ success: "failed", message: "Email already exist." });
          }else{
            const salt = bcrypt.genSaltSync(10);
            const hashPASS = bcrypt.hashSync(Password, salt);
                const User = new UserModel({
                    Password:hashPASS,
                    user_name:user_name,
                    email_id:email_id})//the password from the body and hashed password is different
                await User.save();
                res.send({success: false,
                    statusCode: 500,
                    message:"User Updated Successfully"});          
            }
    
    
    }catch(err){
        console.log(err);
        res.send("Error...");
    }
};

exports.Delete = async (req, res) => {
    console.log(req.params.id);
    const authHeader = req.headers.authorization;
    const authtoken = authHeader.split(" ")[1];
    const decode = jwt.verify(authtoken,token)
    console.log(decode.UserId);
    try {
        let User = await UserModel.findById(decode.UserId);
        console.log(User); // Check what User object is returned
        if (!User) {
            return res.status(404).json({ message: 'User not found' });
        }
        let delete1 = await UserModel.findByIdAndDelete({_id:decode.UserId});
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
      const user = await UserModel.findOne({ email_id });
      if (!user) { 
        return res.send({
            success: false,
            statusCode: 500,
            message:"No user found with that email address."
        });
      }
  
      // Generate OTP and set expiration
    //   const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
      const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
      user.otp = otp;
      user.otpExpires = Date.now() + 3600000; // 1 hour expiration
  
      await user.save();
  
      // Send the OTP via email
      const OTPMail = await SendOTP(user.email_id,otp)
      res.send({
        success: true,
        statusCode: 200,
        message: 'OTP sent to your email.'
    });
    } catch (error) {
      console.error(error);
      res.send({
        success: false,
        statusCode: 500,
        message:'Error sending OTP.'
    });
    }
};

exports.resetPassword = async (req, res) => {
  const { otp,email_id,newPassword } = req.body;
  
    // const valid = validatePassword(Password)
    // if(valid){
    //     return res.status(400).send({message:valid[0]})
    // }
  try {
    const user = await UserModel.findOne({
      email_id,
      otp,
      otpExpires: { $gt: Date.now() } // Check if OTP is valid and not expired
    });

    if (!user) {
        return  res.send({ success: true,
            statusCode: 400, 
            message: 'OTP is invalid or has expired.' });
    }
    const salt = bcrypt.genSaltSync(10);
    const hashPASS = bcrypt.hashSync(newPassword, salt);
      user.password = hashPASS;
      user.otp = undefined;
      user.otpExpires = undefined;

      //await user.save();
      res.send({ success: true,
        statusCode: 200, 
        message: 'Password has been updated.' });

  } catch (error) {
    console.error(error);
    res.send({
        success: false,
        statusCode: 500,
        message:'Error  resetting password.'
    });
  }
};