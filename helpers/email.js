const nodemailer = require('nodemailer')
require('dotenv').config();

async function SendOTP( Email,otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.swap,
            pass: process.env.swap_pass
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

async function sendEmailWithPdf(lead_Id,booking_name,pdfBuffer ) {
  
  const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: process.env.swap,
        pass: process.env.swap_pass
          // user: process.env.USERS,
          // pass: process.env.APP_PASS
      },
      tls: { rejectUnauthorized: false },

      debug: true
  });

  const mailOptions = {
    from: `Swaptography`, // Sender address
    to: `swaptography.acc.departments@gmail.com`, // Recipient email
    subject: `${lead_Id}-${booking_name}-Proforma with Terms PDF`, // Email subject
    text: `Please find the Proforma with Terms PDF attached For ${lead_Id}-${booking_name}`, // Email body
    attachments: [
        {
            filename: 'Proforma_with_Terms.pdf', // File name for the attachment
            content: pdfBuffer, // The PDF buffer
            contentType: 'application/pdf', // MIME type
        },
    ],
};

// Step 3: Send the email
const info = await transporter.sendMail(mailOptions);
console.log(`${lead_Id}-${booking_name}-Proforma with Terms PDF Email sent`,);
  // console.log(info)
  return {info:info,
    message:`${lead_Id}-${booking_name}-Proforma with Terms PDF Email sent`};
}
module.exports = { SendOTP,sendEmailWithPdf};