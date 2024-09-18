const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function Consultant_Wellcome(EmailData, password1) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.RUTVIK,
            pass: process.env.RAPP_PASS
        },
        tls: { rejectUnauthorized: false },
        debug: true
    });
    const templatePath = path.join(__dirname, "..","assets",'email_templets', 'welcome-template.html');
    
    let htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
    htmlTemplate = htmlTemplate
        .replace('{{name}}', EmailData.name)
        .replace('{{user_code}}', EmailData.code)
        .replace('{{email_id}}', EmailData.email_id)
        .replace('{{password}}', password1)
        .replace('{{role}}', EmailData.role)
        .replace('{{sales_assistan_name}}', EmailData.sales_assistan.name || 'N/A')
        .replace('{{sales_assistan_mobile_no}}', EmailData.sales_assistan.mobile_no || 'N/A');

    const mailOptions = {
        from: 'Swaptography Management <your-email@gmail.com>',  
        //to: 'patilrutvik501@gmail.com',
        to: EmailData.email_id,
        subject: `Welcome to Swaptography, ${EmailData.name}!`,
        html: htmlTemplate,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = { Consultant_Wellcome };
