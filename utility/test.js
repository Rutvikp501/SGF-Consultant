
{
    UF_CRM_1725626932463: "",//consultant_code
    UF_CRM_1725958005830: "",//consultant_mobile_no
    UF_CRM_1725957892961: "",//consultant_email_id
    name: "",//event name
    email: "",//email
    phone: "",//phone
    UF_CRM_1723871068885: "",//event_location
    UF_CRM_1725958658829: "",//lead_id
    UF_CRM_1723870992344: "",// Date of issue
    UF_CRM_1723871015696: "",// Booking Name  
    UF_CRM_1723871636157: "",// Date and time of event 
    UF_CRM_1724929500047: "",// Event Type 
    UF_CRM_1726651078700: "",// Event name 
    UF_CRM_1725627014795: "",// eventDate 
    UF_CRM_1725627051950: "",//eventSpecialsName 
    UF_CRM_1725627132023: "",//specialCode
    UF_CRM_1725961934686: "",// Package amount
    UF_CRM_1723870968846: "",// Equiry No
    UF_CRM_1723872311251: "",// City
    UF_CRM_1726651303165: "",// Pincode
}

//   let params = {
//     consultant: '66ab659fdec07a2c29fd9609',
//     name: 'Rutvik',
//     email: 'test1@gmail.com',
//     phone: '12341234',
//     pincode: '421102',
//     eventSpecialsName: 'testing',
//     specialCode: 'code123',
//     leadType: 'Regular',
//     status: 'Pending',
//     events: [
//       {
//         name: 'testing',
//         location: 'mumbai',
//         date: '2024-09-17',
//         timing: '2-5'
//       }
//     ],
//     package: {
//       packageName: 'package',
//       subname: 'subname',
//       addOns: '',
//       amount: 12345
//     }
//   }

const LeadData ={
    consultant: new ObjectId("66ab659fdec07a2c29fd9609"),
    consultant_code: '001',
    consultant_mobile_no: 1111111111,
    consultant_email_id: 'testing12@gmail.com',
    name: 'laxman',
    email: 'Laxman@gmail.com',
    phone: '8097282157',
    events: [
      {
        name: 'Birthday',
        date: 2024-09-18T00:00:00.000Z,
        location: 'ambivali',
        timing: '5 pm to 10 pm'
      }
    ],
    pincode: '421102',
    eventSpecialsName: 'Anita',
    specialCode: '1234',
    leadType: 'Regular',
    status: 'Pending',
    leadID: '001-RI11L8Y24',
    cycle: { label: 'I', number: 9, year: undefined },
    currentDate: 2024-09-18T07:19:15.742Z,
    package: { name: 'premium', subname: 'NA', addonS: [ 'test' ], amount: 0 }
  }
  const requestBody= {
    'fields[NAME]': 'laxman',
    'fields[PHONE][0][VALUE]': '8097282157',
    'fields[PHONE][0][VALUE_TYPE]': 'WORK',
    'fields[EMAIL][0][VALUE]': 'Laxman@gmail.com',
    'fields[EMAIL][0][VALUE_TYPE]': 'WORK',
    'fields[UF_CRM_1725626932463]': '001',
    'fields[UF_CRM_1725958005830]': 1111111111,
    'fields[UF_CRM_1725957892961]': 'testing12@gmail.com',
    'fields[UF_CRM_1723871068885]': 'ambivali',
    'fields[UF_CRM_1725958658829]': '001-RI11L8Y24',
    'fields[UF_CRM_1723870992344]': 2024-09-18T07:19:15.742Z,
    'fields[UF_CRM_1723871015696]': 'laxman',
    'fields[UF_CRM_1723871636157]': 2024-09-18T00:00:00.000Z,
    'fields[UF_CRM_1724929500047]': 'Regular',
    'fields[UF_CRM_1725627014795]': 2024-09-18T00:00:00.000Z,
    'fields[UF_CRM_1725627051950]': 'Anita',
    'fields[UF_CRM_1725627132023]': '1234',
    'fields[UF_CRM_1725961934686]': ''
  }

  const requestBody = {
    'fields[NAME]': LeadData.name || '',
    'fields[PHONE][0][VALUE]': LeadData.phone || '',
    'fields[PHONE][0][VALUE_TYPE]': 'WORK',
    'fields[EMAIL][0][VALUE]': LeadData.email || '',
    'fields[EMAIL][0][VALUE_TYPE]': 'WORK',
    'fields[UF_CRM_1725626932463]': LeadData.consultant_code || '', // consultant_code
    'fields[UF_CRM_1725958005830]': LeadData.consultant_mobile_no || '', // consultant_mobile_no
    'fields[UF_CRM_1725957892961]': LeadData.consultant_email_id || '', // consultant_email_id
    'fields[UF_CRM_1723871068885]': LeadData.events?.[0]?.location || '', // event_location from events array
    'fields[UF_CRM_1723872311251]': LeadData.events?.[0]?.location || '', // event_location from city
    'fields[UF_CRM_1725958658829]': LeadData.leadID || '', // leadID
    'fields[UF_CRM_1723870968846]': LeadData.leadID || '', // Equiry No
    'fields[UF_CRM_1723870992344]': LeadData.currentDate || '', // currentDate
    'fields[UF_CRM_1723871015696]': LeadData.name || '', // name (duplicate but required by the API)
    'fields[UF_CRM_1723871636157]': LeadData.events?.[0]?.date || '', // date from events array
    'fields[UF_CRM_1726651078700]': LeadData.events?.[0]?.name || '', // date from events array
    'fields[UF_CRM_1724929500047]': LeadData.leadType || '', // event_type (assuming it's mapped to leadType)
    'fields[UF_CRM_1726651303165]': LeadData.pincode || '', // event_type (assuming it's mapped to leadType)
    'fields[UF_CRM_1725627014795]': LeadData.events?.[0]?.date || '', // event_date from events array
    'fields[UF_CRM_1725627051950]': LeadData.eventSpecialsName || '', // eventSpecialsName
    'fields[UF_CRM_1725627132023]': LeadData.specialCode || '', // specialCode
    'fields[UF_CRM_1725961934686]': LeadData.package?.amount || '', // package amount
};


/// mail 

const nodemailer = require('nodemailer')
require('dotenv').config();
const path = require('path')
const assetsPath = path.join(__dirname, '..', 'assets');

const pdfPath = path.join(assetsPath, 'RUTVIK-PATIL-CV-.pdf');
const imagePath = path.join(assetsPath, 'image.jpg');

async function sendMailer(EmailData) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.RUTVIK,
            pass: process.env.RAPP_PASS
            // user: process.env.USERS,
            // pass: process.env.APP_PASS
        },
        tls: { rejectUnauthorized: false },

        debug: true
    });

    const mailOptions = {
        from: {
            name: 'Rutvik Patil',
            address: process.env.USERS
        },
        to: EmailData.To,
        subject: EmailData.subject,
        text: EmailData.text,
        //html: '<b>Testing Send mail</b>',
        attachments: [
            {
                filename: 'RUTVIK-PATIL-CV-.pdf',
                path: pdfPath,
                contentType: "application/pdf"
            },
            // {
            //     filename:'image.jpg',
            //     path:imagePath,
            //     contentType:"image/jpg"
            // },
        ]

    };

    // console.log(mailOptions);
    const info = await transporter.sendMail(mailOptions);
    // console.log(info)
    return info;
};

async function Profile_Contact(EmailData) {
    const data = {
        To: "patilrutvik501@gmail.com",
        subject: `Contact`,
        html: `<p>msg from :  ${EmailData.Email} </p>
                   <p>${EmailData.Message}</p>`,
    };
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.RUTVIK,
            pass: process.env.RAPP_PASS
            // user: process.env.USERS,
            // pass: process.env.APP_PASS
        },
        tls: { rejectUnauthorized: false },

        debug: true
    });

    const mailOptions = {
        from: {
            name: 'Rutvik Patil',
            address: process.env.USERS
        },
        to: data.To,
        subject: data.subject,
        text: data.text,
        html: data.html,


    };

    // console.log(mailOptions);
    const info = await transporter.sendMail(mailOptions);
    // console.log(info)
    return info;
};

async function YES_NO(EmailData) {
    const data = EmailData
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.RUTVIK,
            pass: process.env.RAPP_PASS
            // user: process.env.USERS,
            // pass: process.env.APP_PASS
        },
        tls: { rejectUnauthorized: false },

        debug: true
    });

    const mailOptions = {
        from: {
            name: 'Rutvik Patil',
            address: process.env.USERS
        },
        to: data.To,
        subject: data.subject,
        text: data.text,
        html: data.html,


    };

    // console.log(mailOptions);
    const info = await transporter.sendMail(mailOptions);
    // console.log(info)
    return info;
};

async function sendFile( EmailData) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.RUTVIK,
            pass: process.env.RAPP_PASS
            // user: process.env.USERS,
            // pass: process.env.APP_PASS
        },
        tls: { rejectUnauthorized: false },

        debug: true
    });

    const mailOptions = {
        from: 'Rutvik Patil',
        to: EmailData.email,
        subject: ``,
        html: `<p>Hello ${EmailData.name}</p>
        <p>I am a Full-stack Developer.  I have specialized in backend development, With expertise in building secured backend APIs, utilizing Node.js and Express.js to create and manage RESTful APIs. 
        My expertise extends to database management, particularly in MongoDB, Furthermore, my proficiency in crafting responsive front-end pages with HTML, CSS, JavaScript, and EJSand React underscores my commitment to user-centered design. Additionally, I've experience in tools like Gitlab/Github, and Postman.
        </P>
        <p>I have attached my resume for your review and look forward to hear from you.</p>
        
        `,
        attachments: [
            {
                filename: 'RUTVIK-PATIL-CV-.pdf',
                path: pdfPath,
                contentType: "application/pdf"
            },
            // {
            //     filename:'image.jpg',
            //     path:imagePath,
            //     contentType:"image/jpg"
            // },
        ]
    };
    // console.log(mailOptions);
    const info = await transporter.sendMail(mailOptions);
    // console.log(info)
    return info;
}

async function sendFileMailer(extentionType, buffer, EmailData) {
    let EmailTo = 'patilrutvik501@gmail.com';
    let sheetmailer;
    let type;
    if (extentionType == "pdf") {
        sheetmailer = 'application/pdf'
        type = ".pdf";
    }
    else {
        sheetmailer = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        type = ".xlsx";
    }
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.RUTVIK,
            pass: process.env.RAPP_PASS
            // user: process.env.USERS,
            // pass: process.env.APP_PASS
        },
        tls: { rejectUnauthorized: false },

        debug: true
    });

    const mailOptions = {
        from: 'Rutvik Patil',
        to: EmailTo,
        subject: `testing pdf mail send `,
        html: '',
        attachments: [
            {
                content: buffer,
                filename: `testing pdf mail send`,
                contentType:
                    sheetmailer
            }
        ]
    };
    // console.log(mailOptions);
    const info = await transporter.sendMail(mailOptions);
    // console.log(info)
    return info;
}

module.exports = { sendMailer, Profile_Contact, sendFileMailer ,sendFile,YES_NO};