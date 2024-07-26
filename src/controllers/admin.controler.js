
const jwt = require('jsonwebtoken');
const AdviserModel = require('../models/adviser.models');
const token = process.env.token


exports.GetAllAdviser = async (req, res) => {
    try {
        const Adviser  = await AdviserModel.find();
        if (Adviser.length>0){
        res.status(200).send(Adviser)
        }else{
        res.status(200).send("Dont have Advisers To Show...")
        }
    } catch (error) {
        console.log(error);
    }
};

exports.GetSearchedAdviser = async (req, res,next) => {
    try {
        const params = req.body || '';
        const searchParam = params.search;
        const filter = {};

        if (searchParam) {
            filter.$or = [
                { Adviser_code: { $regex: searchParam, $options: 'i' } }, // Case-insensitive search
                { Adviser_name: { $regex: searchParam, $options: 'i' } }
            ];
        }

        const AllSearchedAdviser = await AdviserModel.aggregate([
            { $match: filter },
            {
                $addFields: {
                    name: { $concat: ["$Adviser_name", " - ", "$email_id"] },
                    value: "$Adviser_name"
                }
            },
            { $unset: ["Adviser_name", "email_id"] }, // Remove original fields if needed
            {
                $project: {
                    _id: 0,
                    value: 1,
                    name: 1 // Include only the value and name fields
                }
            }
        ]);

        return res.status(200).json(AllSearchedAdviser);
    } catch (error) {
        console.log(error);
        next(error);
    }
};

exports.Login = async (req, res) => {
    let {email_id,password}=req.body;
    const Adviser  = await AdviserModel.find({email_id});
    console.log(Adviser);
    var getData = JSON.stringify(Adviser);
    var data = JSON.parse(getData);
    console.log(req.body);
    try{
        if (Adviser.length>0){
            const pass = data[0]["password"];
            console.log(pass);
            // let npass = Enc_Dec.DecryptPass(pass);            
                if (password == pass){
                    let keyToken= jwt.sign({AdviserId:Adviser[0]._id},token)//setting up a token using the '_id' in Adviser model
                    data={
                        keyToken:keyToken,
                        Adviser_code:Adviser[0].Adviser_code,
                        Adviser_name:Adviser[0].Adviser_name,
                        email_id:Adviser[0].email_id
                    }
                    console.log(data);
                    res.send(data)
                }else{
                    res.status(500).send("Enter Valid Password ")
                }    
        }
        else{
            res.status(500).send("Adviser not found ...!")
        }
    }catch(error){
        console.log(error);
        res.status(500).send("invalid Credentials3 ")
    }
};

exports.Register = async (req, res) => {
    const {Adviser_code, Adviser_name , email_id ,mobile_no,password }=req.body
    const getExistingAdviser = await AdviserModel.find({ email_id: email_id });   
    // const valid = validatePassword(Password)
    // if(valid){
    //     return res.status(400).send({message:valid[0]})
    // }
    try{

        if (getExistingAdviser != "") {
            return res.send({ status: "failed", message: "Email already exist." });
          }else{
            // console.log("Password",Password);
            //     var Encpass = Enc_Dec.EncryptPass(Password);
                const Adviser = new AdviserModel({
                    Adviser_code:Adviser_code,
                    Adviser_name:Adviser_name,
                    email_id:email_id,
                    mobile_no:mobile_no,
                    password:password
                })//the password from the body and hashed password is different
                await Adviser.save();
                res.send("Adviser Registered Successfully");          
            }
        
    
    }catch(err){
        console.log(err);
        res.send("Error...");
    }
};


exports.Edit = async (req, res) => {
    const { id } = request.body;
    try {
      const result = await AdviserModel.findById(id);
      response.send({
        status: "success",
        data: result,
      });
    } catch (error) {
      console.log(error);
    }
};


exports.Update = async (req, res) => {
    const {Password, Adviser_name , email_id }=req.body
    const getExistingAdviser = await AdviserModel.find({ email_id: email_id });   
    // console.log(getExistingAdviser);
    const valid = validatePassword(Password)
    if(valid){
        return res.status(400).send({message:valid[0]})
    }
    try{
       
        if (getExistingAdviser != "") {
            return res.send({ status: "failed", message: "Email already exist." });
          }else{
                // var Encpass = Enc_Dec.EncryptPass(Password);
                const Adviser = new AdviserModel({
                    Password:Password,
                    Adviser_name:Adviser_name,
                    email_id:email_id})//the password from the body and hashed password is different
                await Adviser.save();
                res.send("Adviser Updated Successfully");          
            }
    
    
    }catch(err){
        console.log(err);
        res.send("Error...");
    }
};

exports.Delete = async (req, res) => {
    console.log(req.params.id);
    try {
        let Adviser = await AdviserModel.findById(req.params.id);
        console.log(Adviser); // Check what Adviser object is returned
        if (!Adviser) {
            return res.status(404).json({ message: 'Adviser not found' });
        }
        let delete1 = await AdviserModel.findByIdAndDelete({_id:req.params.id});
        res.status(200).json({ message: 'Adviser deleted' });
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

