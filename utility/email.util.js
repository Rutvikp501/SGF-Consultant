const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { formatDate } = require('../helpers/sample');
require('dotenv').config();

async function Consultant_Wellcome(EmailData, password1) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.SWAP,
            pass: process.env.SWAP_PASS
        },
        tls: { rejectUnauthorized: false },
        debug: true
    });
    const welcometemplatePath = path.join(__dirname, "..", "assets", 'email_templets', 'welcome-template.html');
    //const cardtemplatePath = path.join(__dirname, "..", "assets", 'email_templets', 'welcomeCard.html');

    const dateOfJoining = new Date(EmailData.dateOfJoining);
    const formattedDate = `${dateOfJoining.getDate().toString().padStart(2, '0')}-${(dateOfJoining.getMonth() + 1).toString().padStart(2, '0')}-${dateOfJoining.getFullYear()}`;

    let welcomehtmlTemplate = fs.readFileSync(welcometemplatePath, 'utf-8');
    welcomehtmlTemplate = welcomehtmlTemplate
        .replace('{{name}}', EmailData.name)
        .replace('{{user_code}}', EmailData.code)
        .replace('{{email_id}}', EmailData.email_id)
        .replace('{{password}}', password1)
        .replace('{{role}}', EmailData.role)
        .replace('{{regular}}', EmailData.currentcycle.regular.cycleLabel)
        .replace('{{seasonal}}', EmailData.currentcycle.seasonal.cycleLabel)
        .replace('{{dateOfJoining}}', formattedDate)
        .replace('{{sales_assistan_name}}', EmailData.sales_assistan.name || 'N/A')
        .replace('{{sales_assistan_mobile_no}}', EmailData.sales_assistan.mobile_no || 'N/A');

    // let cardhtmlTemplate = fs.readFileSync(cardtemplatePath, 'utf-8');
    // cardhtmlTemplate = cardhtmlTemplate
    //     .replace('{{name}}', EmailData.name)
    //     .replace('{{user_code}}', EmailData.code)
    //     .replace('{{email_id}}', EmailData.email_id)
    //     .replace('{{password}}', password1)
    //     .replace('{{role}}', EmailData.role)
    //     .replace('{{regular}}', EmailData.currentcycle.regular.cycleLabel)
    //     .replace('{{seasonal}}', EmailData.currentcycle.seasonal.cycleLabel)
    //     .replace('{{dateOfJoining}}', formattedDate)
    //     .replace('{{sales_assistan_name}}', EmailData.sales_assistan.name || 'N/A')
    //     .replace('{{sales_assistan_mobile_no}}', EmailData.sales_assistan.mobile_no || 'N/A');

    const mailOptions = {
        from: 'Swaptography Management',
        to: EmailData.email_id,
        subject: `CONSULTANT REGISTRATION SUCCESSFUL!`,
        html: welcomehtmlTemplate,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

async function SendOTP(Email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.SWAP,
            pass: process.env.SWAP_PASS
            // user: process.env.USERS,
            // pass: process.env.APP_PASS
        },
        tls: { rejectUnauthorized: false },

        debug: true
    });

    const mailOptions = {
        from: 'Rutvik Patil',
        to: Email,
        subject: `Password Reset OTP`,
        html: `
        <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600"></a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>You are receiving this because you (or someone else) have requested the reset of the password for your account. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />Swaptography Event’s & Film’s LLP
    <br />contact@swaptography.in</p>
    <hr style="border:none;border-top:1px solid #eee" />
    
  </div>
</div>
        `,

    };
    // console.log(mailOptions);
    const info = await transporter.sendMail(mailOptions);
    // console.log(info)
    return info;
}

async function samples(name, email, eventName) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.SWAP,
            pass: process.env.SWAP_PASS
            // user: process.env.USERS,
            // pass: process.env.APP_PASS
        },
        tls: { rejectUnauthorized: false },

        debug: true
    });
    const sampleHtmlTemplatePath = path.join(__dirname, "..", "assets", 'email_templets', 'samples.html');

    let sampleHtmlTemplate = fs.readFileSync(sampleHtmlTemplatePath, 'utf-8');
    sampleHtmlTemplate = sampleHtmlTemplate
        .replace('{{name}}', name)
        .replace('{{email_id}}', email)
        .replace('{{event_Name}}', eventName)
        .replace('{{eventName}}', eventName)
        .replace('{{drivelink}}', determineEventLink(eventName));



    const mailOptions = {
        from: 'Swaptography Management',
        to: email,
        subject: `Sample for ${eventName} Event`,
        html: sampleHtmlTemplate,
    };
    // console.log(mailOptions);
    const info = await transporter.sendMail(mailOptions);
    // console.log(info)
    return info;
}

async function sendEmailWithAttachment(filePath) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.SWAP,
            pass: process.env.SWAP_PASS
            // user: process.env.USERS,
            // pass: process.env.APP_PASS
        },
        tls: { rejectUnauthorized: false },

        debug: true
    });
    const mailOptions = {
        from: 'Bitrix data ',
        to: `rutvik72patil@gmail.com`,
        subject: `Lead Data Attachment`,
        text: 'Please find the attached lead data file.',
        attachments: [
            {
                filename: 'leadData.json',
                path: filePath
            }
        ]
    };
    // console.log(mailOptions);
    const info = await transporter.sendMail(mailOptions);
    // console.log(info)
    return info;
}


module.exports = { Consultant_Wellcome, SendOTP, samples, sendEmailWithAttachment };


