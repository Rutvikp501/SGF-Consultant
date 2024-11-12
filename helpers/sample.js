


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
module.exports = { convertToIST, parseDate, generateLeadID, calculateCycle, calculateLeadCycle,formatDate };