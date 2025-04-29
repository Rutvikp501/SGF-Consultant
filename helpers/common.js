const path = require("path");
const fs = require("fs");
const { format } = require('date-fns');

function formatItemDate(inputDate) {
  const trimmedDate = inputDate.trim();
  const [year, month, day] = trimmedDate.split('-');
  return `${day}/${month}/${year}`;
}
function formatDate(inputDate) {
    return inputDate.toISOString().split('T')[0];
}

const convertToIST = (date) => {
    const offset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds (5 hours 30 minutes)
    return new Date(date.getTime() + offset);
  };
  
  const parseDate = (dateString) => {
    const day = parseInt(dateString.substring(0, 2), 10);
    const month = parseInt(dateString.substring(2, 4), 10) - 1; // Months are zero-based in JavaScript Date
    const year = parseInt(dateString.substring(4), 10);
    const date = new Date(year, month, day);
    return convertToIST(date);
  };
  
  const calculateCycle = () => {
    const date = new Date();
    const startDate = new Date(date.getFullYear(), 0, 1); // Start of the year
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000)); // Days since start of the year
    
    const monthNumber = date.getMonth();
    const year = date.getFullYear();
    const label = String.fromCharCode(65 + monthNumber);
    // Calculate the regular cycle number (each cycle is 60 days)
    const regularCycleNumber = Math.ceil((days + 1) / 60); // Regular cycles are in 60-day intervals
    const regularCycleLabel = String.fromCharCode(64 + regularCycleNumber); // ASCII 'A' = 65, 'B' = 66, etc.
  
    // Seasonal cycle based on months
    const month = date.getMonth() + 1;
    let seasonalCycleLabel = '';
    let seasonalCycleNumber = 0;
  
    if (month <= 2) { seasonalCycleLabel = 'A'; seasonalCycleNumber = 1; } // January-February
    else if (month <= 4) { seasonalCycleLabel = 'B'; seasonalCycleNumber = 2; } // March-April
    else if (month <= 6) { seasonalCycleLabel = 'C'; seasonalCycleNumber = 3; } // May-June
    else if (month <= 8) { seasonalCycleLabel = 'D'; seasonalCycleNumber = 4; } // July-August
    else if (month <= 10) { seasonalCycleLabel = 'E'; seasonalCycleNumber = 5; } // September-October
    else { seasonalCycleLabel = 'F'; seasonalCycleNumber = 6; } // November-December
  
    return {
      regular: { cycleLabel: label, cycleNumber: monthNumber + 1, year: year },
      seasonal: { cycleLabel: seasonalCycleLabel, cycleNumber: seasonalCycleNumber, year: date.getFullYear() }
    };
  };
  const calculateLeadCycle = (leadType, eventDate) => {
    
    const date = new Date(eventDate);
    let leadcycleLabel = '';
    let leadcycleNumber = 0;
  
    if (leadType == 'Seasonal') {
      
      const month = date.getMonth() + 1;
      if (month <= 2) { leadcycleLabel = 'A'; leadcycleNumber = 1; } // January-February
      else if (month <= 4) { leadcycleLabel = 'B'; leadcycleNumber = 2; } // March-April
      else if (month <= 6) { leadcycleLabel = 'C'; leadcycleNumber = 3; } // May-June
      else if (month <= 8) { leadcycleLabel = 'D'; leadcycleNumber = 4; } // July-August
      else if (month <= 10) { cycleLabel = 'E'; cycleNumber = 5; }// September-October
      else { leadcycleLabel = 'F'; leadcycleNumber = 6; }// November-December
      return { Label: leadcycleLabel, Number: leadcycleNumber ,year:date.getFullYear() };
  
    } else {
      const date = new Date(eventDate);
      const monthNumber = date.getMonth();
      const year = date.getFullYear();
      const label = String.fromCharCode(65 + monthNumber);
      return { Label: label, Number: monthNumber + 1, Year: year };
    }
  }
  
  const generateLeadID = (consultantNumber, leadType, cycleMonth, consultantLifetimeCycleNumber, leadNumber, pincode) => {
    const leadTypeCode = leadType === 'Seasonal' ? 'S' : 'R';
  
    const leadYearCode = `Y${new Date().getFullYear() % 100}`;
  
    if (leadType === 'Seasonal') {
      return `${consultantNumber}-${leadTypeCode}${cycleMonth}${consultantLifetimeCycleNumber}L${leadNumber}${leadYearCode}`;
    } else {
      return `${consultantNumber}-${leadTypeCode}${cycleMonth}${consultantLifetimeCycleNumber}L${leadNumber}${leadYearCode}`;
    }
  };
  function formatDate(dateString) {
    const date = new Date(dateString);
    
    // Extract day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  }
  function discountBookingDates(eventDate) {
    
    const event = new Date(eventDate);
    event.setHours(0, 0, 0, 0); // normalize
  
    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove time for accurate comparison
  
    const premiumDiscountSchedule = [
      { daysBefore: 120, discount: "18%" },
      { daysBefore: 105, discount: "16%" },
      { daysBefore: 90,  discount: "14%" },
      { daysBefore: 75,  discount: "12%" },
      { daysBefore: 60,  discount: "10%" },
      { daysBefore: 45,  discount: "8%" }
    ];
  
    const classicDiscountSchedule = [
      { daysBefore: 75, discount: "10%" },
      { daysBefore: 60, discount: "8%" },
      { daysBefore: 45, discount: "6%" }
    ];
  
    const mapDiscountDates = (schedule) => {
      return schedule.map(({ daysBefore, discount }) => {
        const bookingDate = new Date(event);
        bookingDate.setDate(bookingDate.getDate() - daysBefore);
        bookingDate.setHours(0, 0, 0, 0);
  
        const isPast = bookingDate < today;

        return {
          bookingDate: isPast
            ? "N.A"
            : `${String(bookingDate.getDate()).padStart(2, '0')}-${String(bookingDate.getMonth() + 1).padStart(2, '0')}-${bookingDate.getFullYear()}`,
          daysBefore,
          discount
        };
      });
    };
    const premiumDates = mapDiscountDates(premiumDiscountSchedule);
    const classicDates = mapDiscountDates(classicDiscountSchedule);
  
    return {
      premium: premiumDates,
      classic: classicDates
    };
  }


  

  function generateEventTimeline(eventDateStr) {
    const eventDate = new Date(eventDateStr);
    const bookingDate = new Date(); // Current date as booking date
  
    // Util to get ordinal suffix
    const getOrdinal = (n) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };
  
    // Add N working days (skipping weekends)
    const addWorkingDays = (date, daysToAdd) => {
      let dateCopy = new Date(date);
      while (daysToAdd > 0) {
        dateCopy.setDate(dateCopy.getDate() + 1);
        const day = dateCopy.getDay();
        if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
          daysToAdd--;
        }
      }
      return dateCopy;
    };
  
    // Format a date as "7th Jan 26"
    const formatDate = (date) => {
      const day = getOrdinal(date.getDate());
      const month = format(date, 'MMM');
      const year = format(date, 'yy');
      return `${day} ${month} ${year}`;
    };
  
    const milestones = [
      { title: "Invitation Video Creation", useBookingDate: true },
      { title: "Decor & Costume Consultation", offset: -30 },
      { title: "Blueprint-based Planning", offset: -17 },
      { title: "Event Schedule / Entry Audio Selection", offset: -17 },
      { title: "Song Selection", offset: -17 },
      { title: "Reminder Call", offset: -6 },
      { title: "Timely Arrival (Main Event)", offset: 0 },
      { title: "Soft Copy + Photo Selection", offset: 6 },
      { title: "Traditional Film Raw Draft", offset: 11 },
      { title: "Cinematic Reels - General", offset: 21 },
      { title: "Highlights - First Draft", offset: 21 },
      { title: "Traditional Film - First Draft", offset: 46 },
      { title: "Highlights - Final Draft", offset: 57 },
      { title: "Traditional Film - Final Delivery", offset: 60 },
    ];
  
    const results = milestones.map(({ title, offset = 0, useBookingDate = false }) => {
      let date;
      if (useBookingDate) {
        const videoDate = addWorkingDays(bookingDate, 4);
        date = formatDate(videoDate);
        return { title, date, note: "within 4 working days of booking" };
      } else {
        const adjustedDate = new Date(eventDate);
        adjustedDate.setDate(adjustedDate.getDate() + offset);
        return {
          title,
          date: formatDate(adjustedDate),
          daysFromEvent: offset,
        };
      }
    });
  
    return results;
  }
  

module.exports = { generateEventTimeline,discountBookingDates,convertToIST, formatDate,parseDate, generateLeadID, calculateCycle, calculateLeadCycle,formatDate,formatItemDate };

exports.read_image = (file_Path) => {
    const filePath = path.join(`${file_Path}`);
    const image = fs.readFileSync(filePath,);
    const imageBase = Buffer.from(image).toString('base64');
    const returnImg = `data:image/jpeg;base64,${imageBase}`;
    return returnImg;
}
exports.addDaysToDate = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
exports.formatDate = (date) => {
    return date.toISOString().split('T')[0];
}


