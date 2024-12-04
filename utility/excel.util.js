const ExcelJS = require('exceljs');

const getCommissionexcel = async (Leads) => {
    try {

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Converted Lead Details');

        // Set up the top information (Consultant code, lead ID, etc.)
        worksheet.addRow(['Consultant Code', Leads.consultant_code]);
        worksheet.addRow(['Lead ID', Leads.leadID]);
        worksheet.addRow(['Name', Leads.name]);
        worksheet.addRow(['Email', Leads.email]);
        worksheet.addRow(['Phone', Leads.phone]);

        worksheet.addRow([]); // Add a blank row for spacing

        // Set up table headers for invoice details
        worksheet.addRow(['Invoice Number', 'Invoice Name', 'Payment Status', 'Total Amount', 'Percentage', 'Commission']);

        // Variables to keep track of totals
        let totalAmount = 0;
        let totalCommission = 0;

        // Add invoice data and calculate totals
        Leads.invoice.forEach(invoice => {
            worksheet.addRow([
                invoice.number,
                invoice.name,
                invoice.paymentstatus,
                invoice.totalamount,
                invoice.percentage,
                invoice.commission
            ]);

            // Sum totals for amount and commission
            totalAmount += parseFloat(invoice.totalamount);
            totalCommission += parseFloat(invoice.commission);
        });

        // Add a blank row for spacing
        worksheet.addRow([]);

        // Add the total row at the end
        worksheet.addRow(['', '', 'Total:', totalAmount, '', totalCommission]);

        // Set column widths
        worksheet.columns = [
            { key: 'Invoice Number', width: 15 },
            { key: 'Invoice Name', width: 25 },
            { key: 'Payment Status', width: 15 },
            { key: 'Total Amount', width: 15 },
            { key: 'Percentage', width: 10 },
            { key: 'Commission', width: 15 }
        ];

        // Return Excel as a buffer
        const buffer = await workbook.xlsx.writeBuffer();
        return buffer;

    } catch (error) {
        console.error(error);
        throw new Error('Error generating Excel file: ' + error.message);
    }
};

const getuserexcel = async (filteredConsultants) => {
   // console.log(filteredConsultants);
    
    try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Consultants');
        
            // Add headers to the worksheet
            worksheet.columns = [
                { header: '#', key: 'index', width: 5 },
                { header: 'Code', key: 'code', width: 10 },
                { header: 'Name', key: 'name', width: 20 },
                { header: 'Email', key: 'email_id', width: 30 },
                { header: 'Phone', key: 'mobile_no', width: 15 },
                { header: 'Join Date', key: 'dateOfJoining', width: 20 },
                { header: 'Lifetime Cycle', key: 'consultantLifetimeCycleNumber', width: 20 },
                { header: 'Pincode', key: 'pincode', width: 10 },
                { header: 'City', key: 'city', width: 15 }
            ];
          
            // Add data to the worksheet
            filteredConsultants.forEach((consultant, index) => {
                const dateOfJoining = new Date(consultant.dateOfJoining);
                const formattedDate = `${dateOfJoining.getDate().toString().padStart(2, '0')}-${(dateOfJoining.getMonth() + 1).toString().padStart(2, '0')}-${dateOfJoining.getFullYear()}`;
                worksheet.addRow({
                    index: index + 1,
                    code: consultant.code,
                    name: consultant.name,
                    email_id: consultant.email_id,
                    mobile_no: consultant.mobile_no,
                    dateOfJoining: formattedDate,
                    consultantLifetimeCycleNumber: consultant.consultantLifetimeCycleNumber,
                    pincode: consultant.pincode||"",
                    city: consultant.city||""
                });
            });
        
            // Write workbook to buffer
            const buffer = await workbook.xlsx.writeBuffer();
            return buffer; // Return the buffer
        }
   catch (error) {
        console.error(error);
        throw new Error('Error generating Excel file: ' + error.message);
    }}


module.exports = {getCommissionexcel,getuserexcel};
