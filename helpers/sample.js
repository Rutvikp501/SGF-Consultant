const calculateCycle = () => {
  const date = new Date();
  const startDate = new Date(date.getFullYear(), 0, 1);  // Start of the year
  const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));  // Days since start of the year

  // Calculate the cycle number (each cycle is 60 days)
  const cycleNumber = Math.ceil((days + 1) / 60);  // Adding 1 to include the start of the first cycle in day count

  // Ensure cycle number falls within a reasonable range (e.g., 1-6)
  const cycleLabel = String.fromCharCode(64 + cycleNumber);  // ASCII 'A' starts at 65, 'B' at 66, etc.

  return { cycleLabel: cycleLabel, cycleNumber: cycleNumber };
};


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


const calculateLeadCycle = (leadType, eventDate) => {
  const date = new Date(eventDate);
  let leadcycleLabel = '';
  let leadcycleNumber = 0;

  if (leadType === 'Seasonal') {
    const month = date.getMonth() + 1;
    if (month <= 2) { leadcycleLabel = 'A'; leadcycleNumber = 1; } // January-February
    else if (month <= 4) { leadcycleLabel = 'B'; leadcycleNumber = 2; } // March-April
    else if (month <= 6) { leadcycleLabel = 'C'; leadcycleNumber = 3; } // May-June
    else if (month <= 8) { leadcycleLabel = 'D'; leadcycleNumber = 4; } // July-August
    else if (month <= 10) { cycleLabel = 'E'; cycleNumber = 5; }// September-October
    else { leadcycleLabel = 'F'; leadcycleNumber = 6; }// November-December

  } else {
    // Regular lead cycles
    leadcycleNumber = Math.floor((date.getMonth() + 1) / 2) + 1;
    leadcycleLabel = String.fromCharCode(64 + leadcycleNumber); // Convert 1 -> 'A', 2 -> 'B', etc.
  }
  return { Label: leadcycleLabel, Number: leadcycleNumber ,year:date.getFullYear() };
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

module.exports = { convertToIST, parseDate, generateLeadID, calculateCycle, calculateLeadCycle };