
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.models');
const { calculateCycle, parseDate } = require('../helpers/sample');
const { SendOTP } = require('../helpers/email');
const token = process.env.token


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

exports.GetSearchedUser = async (req, res,next) => {
    try {
        const params = req.body || '';
        console.log(params);
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
                $addFields: {
                    name: { $concat: ["$name", " - ", "$email_id"] },
                    value: "$name"
                }
            },
            { $unset: ["name", "email_id"] }, // Remove original fields if needed
            {
                $project: {
                    _id: 0,
                    value: 1,
                    name: 1 // Include only the value and name fields
                }
            }
        ]);

        return res.status(200).json(AllSearchedUser);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

exports.Login = async (req, res) => {
    let {email_id,password}=req.body;
    const User  = await UserModel.find({email_id});
    console.log(User);
    var getData = JSON.stringify(User);
    var data = JSON.parse(getData);
    console.log(req.body);
    try{
        if (User.length>0){
            const pass = data[0]["password"];
            console.log(pass);
            // let npass = Enc_Dec.DecryptPass(pass);            
                if (password == pass){
                    let keyToken= jwt.sign({UserId:User[0]._id},token)//setting up a token using the '_id' in User model
                    data={
                        keyToken:keyToken,
                        User_code:User[0].User_code,
                        User_name:User[0].User_name,
                        email_id:User[0].email_id
                    }
                    console.log(data);
                    res.send(data)
                    res.redirect('/dashboard');
                }else{
                    res.status(500).send("Enter Valid Password ")
                }    
        }
        else{
            res.status(500).send("User not found ...!")
        }
    }catch(error){
        console.log(error);
        res.status(500).send("invalid Credentials3 ")
    }
};

exports.Register = async (req, res) => {
    const {User_code, User_name , email_id ,mobile_no,password,dateOfJoining ,isAdmin }=req.body
    const getExistingUser = await UserModel.find({ email_id: email_id });  
    const duplicatecode = await UserModel.find({ code: User_code });  
    // const valid = validatePassword(Password)
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
            // console.log("Password",Password);
            //     var Encpass = Enc_Dec.EncryptPass(Password);
            const date = parseDate(dateOfJoining);
            const {cycleLabel,cycleNumber} = calculateCycle(date);
                const User = new UserModel({
                    code:User_code,
                    name:User_name,
                    email_id:email_id,
                    mobile_no:mobile_no,
                    isAdmin:isAdmin,
                    password:password,
                    dateOfJoining: date,
                    currentcycle: {label: cycleLabel,number:cycleNumber},
                })
                await User.save();
                res.send("User Registered Successfully");          
            }
        
    
    }catch(err){
        console.log(err);
        res.send("Error...");
    }
};

exports.Edit = async (req, res) => {
    const { id } = request.body;
    try {
      const result = await UserModel.findById(id);
      response.send({
        success: "success",
        data: result,
      });
    } catch (error) {
      console.log(error);
    }
};

exports.Update = async (req, res) => {
    const {Password, User_name , email_id }=req.body
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
                // var Encpass = Enc_Dec.EncryptPass(Password);
                const User = new UserModel({
                    Password:Password,
                    User_name:User_name,
                    email_id:email_id})//the password from the body and hashed password is different
                await User.save();
                res.send("User Updated Successfully");          
            }
    
    
    }catch(err){
        console.log(err);
        res.send("Error...");
    }
};

exports.Delete = async (req, res) => {
    console.log(req.params.id);
    try {
        let User = await UserModel.findById(req.params.id);
        console.log(User); // Check what User object is returned
        if (!User) {
            return res.status(404).json({ message: 'User not found' });
        }
        let delete1 = await UserModel.findByIdAndDelete({_id:req.params.id});
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
    console.log(email_id);
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
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
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
      return res.status(400).send({ message: 'OTP is invalid or has expired.' });
    }
// console.log("Password",Password);
            //     var Encpass = Enc_Dec.EncryptPass(Password)
      user.password = newPassword;
      user.otp = undefined;
      user.otpExpires = undefined;

      //await user.save();
      res.status(200).send({ message: 'Password has been updated.' });

  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error resetting password.' });
  }
};