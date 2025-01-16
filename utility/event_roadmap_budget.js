const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { read_image, addDaysToDate } = require("../helpers/common");

exports.generateRoadmap = async (startDate,eventDate) => {
    
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
