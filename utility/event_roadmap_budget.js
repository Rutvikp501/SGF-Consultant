const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { read_image, addDaysToDate, generateEventTimeline, formatItemDate, formatDate, } = require("../helpers/common");
const { discountBookingDates } = require('../helpers/common');



exports.roadmapdates = async (startDate, eventDate) => {

    try {
        const bookingDate = new Date(startDate);
        const eventDateObj = new Date(eventDate);

        const timePeriod = Math.ceil((eventDateObj - bookingDate) / (30 * 24 * 60 * 60 * 1000));

        let slots = {};

        if (timePeriod >= 6) {
            slots = {
                venue: addDaysToDate(bookingDate, 21),
                decor: addDaysToDate(bookingDate, 21 + 14),
                catering: addDaysToDate(bookingDate, 21 + 14),
                attire: addDaysToDate(eventDateObj, -60),
                makeup: addDaysToDate(eventDateObj, -60),
                travel: addDaysToDate(eventDateObj, -45),
                photography: addDaysToDate(eventDateObj, -45),
            };
        } else if (timePeriod >= 4) {
            slots = {
                venue: addDaysToDate(bookingDate, 21),
                decor: addDaysToDate(bookingDate, 21 + 14),
                catering: addDaysToDate(bookingDate, 21 + 14),
                attire: addDaysToDate(eventDateObj, -60),
                makeup: addDaysToDate(eventDateObj, -45),
                travel: addDaysToDate(eventDateObj, -45),
                photography: addDaysToDate(eventDateObj, -45),
            };
        } else if (timePeriod >= 3) {
            slots = {
                venue: addDaysToDate(bookingDate, 14),
                decor: addDaysToDate(bookingDate, 14 + 14),
                catering: addDaysToDate(bookingDate, 14 + 14),
                attire: addDaysToDate(eventDateObj, -45),
                makeup: addDaysToDate(eventDateObj, -45),
                travel: addDaysToDate(eventDateObj, -30),
                photography: addDaysToDate(eventDateObj, -30),
            };
        } else if (timePeriod >= 2) {
            slots = {
                venue: addDaysToDate(bookingDate, 10),
                decor: addDaysToDate(bookingDate, 10 + 10),
                catering: addDaysToDate(bookingDate, 10 + 10),
                attire: addDaysToDate(eventDateObj, -30),
                makeup: addDaysToDate(eventDateObj, -30),
                travel: addDaysToDate(eventDateObj, -15),
                photography: addDaysToDate(eventDateObj, -15),
            };
        } else {
            slots = {
                venue: addDaysToDate(bookingDate, 7),
                decor: addDaysToDate(bookingDate, 7 + 7),
                catering: addDaysToDate(bookingDate, 7 + 7),
                attire: addDaysToDate(eventDateObj, -15),
                makeup: addDaysToDate(eventDateObj, -15),
                travel: addDaysToDate(eventDateObj, -10),
                photography: addDaysToDate(eventDateObj, -10),
            };
        }

        return slots;

    } catch (error) {
        console.error('Error generating or merging PDF:', error);
        throw new Error('Error generating Proforma PDF with T&C!');
    }
};

exports.generateRoadmap = async (data) => {
    const pdfPath = 'assets/pdf/CUSTOMER ROADMAP 27 MARCH 25.pdf'; // Make sure this file is accessible
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const Page1 = pdfDoc.getPages()[0];
    const Page2 = pdfDoc.getPages()[1];
    const Page3 = pdfDoc.getPages()[2];
    const Page4 = pdfDoc.getPages()[3];
    const boldFont = pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Example usage
    const eventDateTable = generateEventTimeline(data.events[0].date);
    const { premium, classic } = discountBookingDates(data.events[0].date);
    // Define customer details dynamically from request body
    const roadmapData = {
        customerName: data.name ,
        customerId: data.leadID ,
        eventDate: formatDate(data.events[0].date) ,
        eventType: data.events[0].name ,
        emailId: data.email ,
        phoneNumber: data.phone ,
        consultantName: data.consultant.name,
        consultantId: data.consultant.code 
    };


    //Add text at specific coordinates (adjust as per the PDF layout)
    Page1.drawText(`${roadmapData.customerName}`, { x: 130, y: 675, size: 10, color: rgb(0, 0, 0), font: helveticaFont });
    Page1.drawText(`${roadmapData.customerId}`, { x: 130, y: 655, size: 10, color: rgb(0, 0, 0), font: helveticaFont });
    Page1.drawText(`${roadmapData.eventDate}`, { x: 130, y: 635, size: 10, color: rgb(0, 0, 0), font: helveticaFont });
    Page1.drawText(`${roadmapData.consultantName}`, { x: 130, y: 610, size: 10, color: rgb(0, 0, 0), font: helveticaFont });
    Page1.drawText(`${roadmapData.eventType}`, { x: 400, y: 675, size: 10, color: rgb(0, 0, 0), font: helveticaFont });
    Page1.drawText(`${roadmapData.emailId}`, { x: 400, y: 655, size: 10, color: rgb(0, 0, 0), font: helveticaFont });
    Page1.drawText(`${roadmapData.phoneNumber}`, { x: 400, y: 635, size: 10, color: rgb(0, 0, 0), font: helveticaFont });
    Page1.drawText(`${roadmapData.consultantId}`, { x: 400, y: 610, size: 10, color: rgb(0, 0, 0), font: helveticaFont });


    let cy = 470;
    const cx = 130;
    classic.forEach(({ bookingDate }) => {
        Page1.drawText(bookingDate, { x: cx, y: cy, size: 12, font: helveticaFont, color: rgb(1, 0, 0) });
        cy -= 30;
    });
    let px1 = 320;
    let py1 = 470;
    let px2 = 480;
    let py2 = 470;

    premium.forEach(({ bookingDate }, index) => {
        const targetX = index < 3 ? px1 : px2;
        const targetY = index < 3 ? py1 - index * 30 : py2 - (index - 3) * 30;
        Page1.drawText(bookingDate, { x: targetX, y: targetY, size: 12, font: helveticaFont, color: rgb(1, 0, 0) });
    });
    const positions = [
        { x: 480, y: 600 },
        { x: 480, y: 540 },
        { x: 480, y: 480 },
        { x: 480, y: 420 },
        { x: 480, y: 360 },
        { x: 480, y: 300 },
        { x: 480, y: 200 },
        { x: 480, y: 600 },
        { x: 480, y: 540 },
        { x: 480, y: 480 },
        { x: 480, y: 420 },
        { x: 480, y: 360 },
        { x: 480, y: 280 },
        { x: 480, y: 220 }
      ];
      eventDateTable.forEach((item, i) => {
        const pos = positions[i];
        const displayText = `${item.date}`;
      
        if (i <= 6) {
          // First 7 dates → Page 3
          Page3.drawText(displayText, {
            x: pos.x,
            y: pos.y,
            size: 10,
            color: rgb(0, 0, 0),
            font: helveticaFont
          });
        } else {
          // Remaining dates → Page 4
          Page4.drawText(displayText, {
            x: pos.x,
            y: pos.y,
            size: 10,
            color: rgb(0, 0, 0),
            font: helveticaFont
          });
        }
      });
          
    // Save the updated PDF and return as buffer
    const modifiedPdfBytes = await pdfDoc.save();
    return Buffer.from(modifiedPdfBytes);
}

