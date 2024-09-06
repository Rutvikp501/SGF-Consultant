const axios = require('axios');

exports.addLead = async(LeadData)=> {
    // console.log("bitrixlog",LeadData.consultant_email_id);
	try {
        // const response = await axios.post(`https://swaptography.bitrix24.in/rest/8/t6107s6fsf94wfo9/crm.lead.add.json?fields[NAME]=Rutvik&fields[SECOND_NAME]=&fields[LAST_NAME]=Patil&fields[PHONE][0][VALUE]=8591575854&fields[PHONE][0][VALUE_TYPE]=WORK&fields[EMAIL][0][VALUE]=test@goo.com&fields[EMAIL][0][VALUE_TYPE]=WORK `, {
        //     headers: {
        //       'Content-Type': 'application/json',
        //     }
        //   });
        //   if (response.status) {
        //     // console.log("Lead successfully added:", response);
        //     return {
        //         status: true,
        //         statusCode: 200,
        //         message: 'suceesfully added ',
        //     };
        //   } else {
        //     console.error("Failed to add lead:", response.error);
        //     return{            
        //         status: false,
        //         statusCode: 500,
        //         error: err.message}
        //   }
return {
    status: true,
    statusCode: 200,
    message: 'suceesfully added ',
};
	} catch (err) {
        console.error('Error adding lead:', err.message);
        return {
            status: false,
            statusCode: 500,
            error: err.message
        };
	}
  }