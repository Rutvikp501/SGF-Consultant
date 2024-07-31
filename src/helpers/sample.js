exports.calculateCycle = (date) => {
    const startDate = new Date(date.getFullYear(), 0, 1);  // Start of the year
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));  // Days since start of the year
    
    // Calculate the cycle number (each cycle is 60 days)
    const cycleNumber = Math.ceil((days + 1) / 60);  // Adding 1 to include the start of the first cycle in day count
  
    // Ensure cycle number falls within a reasonable range (e.g., 1-6)
    const cycleLabel = String.fromCharCode(64 + cycleNumber);  // ASCII 'A' starts at 65, 'B' at 66, etc.
  
    return { cycleLabel: cycleLabel, cycleNumber: cycleNumber };
  };
  exports.parseDate = (dateString) => {
    const day = parseInt(dateString.substring(0, 2), 10);
    const month = parseInt(dateString.substring(2, 4), 10) - 1; // Months are zero-based in JavaScript Date
    const year = parseInt(dateString.substring(4), 10);
  
    return new Date(year, month, day);
  };

  async function calculateCycle(leadType, eventDate) {
    const date = new Date(eventDate);
    if (leadType === 'Seasonal') {
        const month = date.getMonth() + 1;
        if (month <= 2) return 'A'; // January-February
        else if (month <= 4) return 'B'; // March-April
        else if (month <= 6) return 'C'; // May-June
        else if (month <= 8) return 'D'; // July-August
        else if (month <= 10) return 'E'; // September-October
        else return 'F'; // November-December
    } else {
        // Regular lead cycles, for example, A for cycle 1, B for cycle 2, etc.
        const cycleNumber = Math.floor((date.getMonth() + 1) / 2) + 1;
        return String.fromCharCode(64 + cycleNumber); // Convert 1 -> 'A', 2 -> 'B', etc.
    }
}