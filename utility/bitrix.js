


exports.addLead = async(LeadData)=> {
	try {
console.log(LeadData);

return {
    status: true,
    statusCode: 200,
    message: 'suceesfully added ',
};
	} catch (err) {
        return {
            status: false,
            statusCode: 500,
            error: err.message
        };
	}
  }