const PdfPrinter = require('pdfmake');
const ejs = require("ejs")
const fs = require("fs");
const path = require("path");
const { read_image } = require("../helpers/common");
const letterhead = path.join(__dirname, `../assets/images/letter head.jpg`);
const watermark = path.join(__dirname, `../assets/images/swaptography-TAB-watermark.png`);
const bankdetailImage = path.join(__dirname, `../assets/images/bank_details .png`);
const fonts = {
    Roboto: {
        normal: 'node_modules/roboto-font/fonts/Roboto/roboto-regular-webfont.ttf',
        bold: 'node_modules/roboto-font/fonts/Roboto/roboto-bold-webfont.ttf',
        italics: 'node_modules/roboto-font/fonts/Roboto/roboto-italic-webfont.ttf',
        bolditalics: 'node_modules/roboto-font/fonts/Roboto/roboto-bolditalic-webfont.ttf'
    }
};
exports.create_50_50_pdf = async (pdfdata) => {
    try {
        const printer = new PdfPrinter(fonts);
        const { params, serviceitems,paymentstatus } = pdfdata;
        // 50-50 Split
        const part1_50_50 = params.finalTotal * 0.50;
        const part2_50_50 = params.finalTotal * 0.50;
        
        
        const paidText1 = paymentstatus[0] && paymentstatus[0].isPaid
        ? `Paid  ${paymentstatus[0].paymentDate}`
        : paymentstatus[0] ? `Pending  ${paymentstatus[0].paymentDate}` : 'No Data';
        
        const paidText2 = paymentstatus[1] && paymentstatus[1].isPaid
        ? `Paid  ${paymentstatus[1].paymentDate}`
        : paymentstatus[1] ? `Pending  ${paymentstatus[1].paymentDate}` : 'No Data';
        
        
        const tableHeaders = [
            { text: "Sr No", bold: true, alignment: "center", fontSize: 10, },
            { text: "Service Name", bold: true, alignment: "center", fontSize: 10, },
            { text: "Description", bold: true, alignment: "center", fontSize: 10, },
            { text: "Date", bold: true, alignment: "center", fontSize: 10, },
            { text: "QTY", bold: true, alignment: "center", fontSize: 10, },
            { text: "Discount", bold: true, alignment: "center", fontSize: 10, },
            { text: "Total AMT", bold: true, alignment: "center", fontSize: 10, },
        ];
        
        console.log("im here create_50_50_pdf")
        
        const serviceRows = serviceitems.map((item, index) => [
            { text: index + 1, alignment: "center", fontSize: 10, },
            { text: `${item.name}/${item.subname}`, color: "red", alignment: "center", fontSize: 10, },
            { text: item.detailed_description, alignment: "center", fontSize: 10, },
            { text: item.date, alignment: "center", fontSize: 10, },
            { text: item.quantity, alignment: "center", fontSize: 10, },
            { text: params.discount ? `${params.discount}%` : "-", alignment: "center", fontSize: 10, },
            { text: item.quantity * item.retail_price, alignment: "right", fontSize: 10, }, // Calculate total for each row
        ]);
        
        const serviceTableBody = [tableHeaders, ...serviceRows];

        let dd = {
            pageMargins: [40, 150, 40, 100],

            background: function (currentPage, pageSize) {
                if (currentPage === 1) {
                    return {

                        image: letterhead,
                        width: 600,
                        absolutePosition: { x: 0, y: 0 },
                        opacity: 1,
                    };
                } else {
                    return {
                        pageMargins: [40, 100, 40, 100],
                        image: watermark,
                        width: 300,
                        absolutePosition: {
                            x: (pageSize.width - 200) / 2,
                            y: (pageSize.height - 200) / 2
                        },
                        opacity: 0.1,
                    };
                }
            },
            content: [
                {
                    margin: [0, 0, 0, 0],
                    style: 'tableExample',
                    table: {
                        widths: [350, '*', '*'],
                        body: [
                            [
                                {
                                    rowSpan: 3,
                                    fontSize: 10,
                                    text: `Booking Name: ${params.booking_name}\nQuotation No: ${params.quotation_no}\nQuotation Date: ${params.quotation_date}`
                                },
                                {
                                    colSpan: 2,
                                    rowSpan: 3,
                                    fontSize: 10,
                                    text: `Specials Name: ${params.specials_name}\nEvent Name: ${params.event_name}`
                                },
                                {}
                            ],
                            [
                                {},
                                {},
                                {}
                            ],
                            [
                                {},
                                {},
                                {}
                            ],
                        ]
                    }
                },
                {
                    margin: [0, 0, 0, 0],
                    fontSize: 10,
                    table: {
                        widths: ["100%"],
                        body: [
                            [ { text: `Email :${params.email_id} \nMobile No:${params.mobile_no}
                                Date Of Event: ${params.event_date}\nTime Of Event:${params.event_time}
                                Event Location: ${params.event_location}\nHome Address: ${params.home_address} `, },
                            ],
                        ],
                    },
                },
                {
                    margin: [0, 0, 0, 0],
                    table: {
                        widths: ["*"], // "*" ensures the column takes up all available space
                        body: [
                            [
                                {
                                    text: "PHOTOGRAPHY SERVICE’S",
                                    alignment: "center", // Center-align the text
                                    bold: true,          // Make the text bold
                                    fontSize: 12        // Set font size
                                }
                            ],
                        ],
                    },
                    layout: "noBorders", // Remove table borders if needed
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ["5%", "20%", "35%","15%","5%", "10%", "10%"],
                        body: serviceTableBody,
                    },
                },
                {
                    margin: [0, 0, 0, 20],
                    table: {
                        widths: ["80%", "20%"],
                        body: [
                            [
                                { text: "Gross Cost", alignment: "right", bold: true, fontSize: 10, },
                                { text: params.subtotal, alignment: "right", fontSize: 10, },
                            ],
                            [
                                { text: "Discount", alignment: "right", bold: true, fontSize: 10, },
                                {
                                    text: `(${params.discount}%)    -${params.discountamnt}`,
                                    alignment: "right", fontSize: 10,
                                },
                            ],
                            [
                                { text: "GST", alignment: "right", bold: true, fontSize: 10, },
                                { text: params.gst, alignment: "right", fontSize: 10, },
                            ],
                            [
                                { text: "Net Cost", alignment: "right", bold: true, fontSize: 10, },
                                { text: params.finalTotal, alignment: "right", fontSize: 10, },
                            ],
                        ],
                    },
                },
                {
                    text: '(BY USING OUR SERVICES, YOU AGREE TO BE BOUND OUR TERMS AND CONDITIONS.)',
                    fontSize: 10,
                    alignment: 'center',
                    italics: true,
                    color: 'red',
                    pageBreak: 'before',
                    margin: [0, -50, 0, 10]
                },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['20%', '40%', '20%', '20%'],
                        body: [
                            [
                                { text: 'Sr. No', bold: true, alignment: 'center', color: 'red', fontSize: 10 },
                                { text: 'PAYMENT PROCEDURE', bold: true, alignment: 'center', color: 'green', fontSize: 10 },
                                { text: 'AMOUNT', bold: true, alignment: 'center', color: 'blue', fontSize: 10 },
                                { text: 'DUE DATE', bold: true, alignment: 'center', color: 'red', fontSize: 10 },
                            ],
                            [
                                { text: '1)', alignment: 'left', fontSize: 10 },
                                { text: '   50% ADVANCE PAYMENT OF TOTAL NET SERVICE COST', alignment: 'left', fontSize: 10 },
                                { text: `${part1_50_50}`, alignment: 'right', fontSize: 10 },
                                { text: paidText1, alignment: 'right', fontSize: 10 },
                            ],
                            [
                                { text: '2)', alignment: 'left', fontSize: 10 },
                                { text: '50% OF TOTAL NET SERVICE COST ON EVENT DAY', alignment: 'left', fontSize: 10 },
                                { text: `${part1_50_50}`, alignment: 'right', fontSize: 10 },
                                { text: paidText2, alignment: 'right', fontSize: 10 },
                            ],
                        ]
                    }
                },
                { text: '', margin: [20, 20, 20, 0] },
                {
                    image: bankdetailImage, // or provide the image URL
                    width: 540, // Adjust the image width as needed
                    height: 200, // Adjust the image height as needed
                    alignment: 'center', // Adjust alignment as needed
                    margin: [0, 0] // Margin to add space around the image if needed
                },


            ],
        };

        const pdfDoc = printer.createPdfKitDocument(dd);

        // Convert stream to buffer
        const chunks = [];
        pdfDoc.on('data', chunk => chunks.push(chunk));
        pdfDoc.on('end', () => null);
        pdfDoc.end();

        return new Promise((resolve, reject) => {
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
        });
    } catch (error) {
        console.error(error);
        throw new Error('Error generating PDF');
    }
};

exports.create_10_40_50_pdf = async (pdfdata) => {
    try {
        const printer = new PdfPrinter(fonts);

        const { params, serviceitems,finalTotal,  } = pdfdata;

        // 10-40-50 Split
        const part1_10 = params.finalTotal * 0.10;
        const part2_40 = params.finalTotal * 0.40;
        const part3_50 = params.finalTotal * 0.50;

        const paidText1 = params.paymentstatus && params.paymentstatus[0]
        ? params.paymentstatus[0].isPaid
            ? `Paid ${params.paymentstatus[0].paymentDate}`
            : `Pending ${params.paymentstatus[0].paymentDate}`
        : 'No Data';
    
    const paidText2 = params.paymentstatus && params.paymentstatus[1]
        ? params.paymentstatus[1].isPaid
            ? `Paid ${params.paymentstatus[1].paymentDate}`
            : `Pending ${params.paymentstatus[1].paymentDate}`
        : 'No Data';
    
    const paidText3 = params.paymentstatus && params.paymentstatus[2]
        ? params.paymentstatus[2].isPaid
            ? `Paid ${params.paymentstatus[2].paymentDate}`
            : `Pending ${params.paymentstatus[2].paymentDate}`
        : 'No Data';
    

        // Create table headers
        const tableHeaders = [
            { text: "Sr No", bold: true, alignment: "center", fontSize: 10, },
            { text: "Service Name", bold: true, alignment: "center", fontSize: 10, },
            { text: "Description", bold: true, alignment: "center", fontSize: 10, },
            { text: "Date", bold: true, alignment: "center", fontSize: 10, },
            { text: "QTY", bold: true, alignment: "center", fontSize: 10, },
            { text: "Discount", bold: true, alignment: "center", fontSize: 10, },
            { text: "Total AMT", bold: true, alignment: "center", fontSize: 10, },
        ];


        const serviceRows = serviceitems.map((item, index) => [
            { text: index + 1, alignment: "center", fontSize: 10, },
            { text: `${item.name}/${item.subname}`, color: "red", alignment: "center", fontSize: 10, },
            { text: item.detailed_description, alignment: "center", fontSize: 10, },
            { text: item.date, alignment: "center", fontSize: 10, },
            { text: item.quantity, alignment: "center", fontSize: 10, },
            { text: params.discount ? `${params.discount}%` : "-", alignment: "center", fontSize: 10, },
            { text: item.quantity * item.retail_price, alignment: "right", fontSize: 10, }, // Calculate total for each row
        ]);

        const serviceTableBody = [tableHeaders, ...serviceRows];

        let dd = {
            pageMargins: [40, 150, 40, 100],

            background: function (currentPage, pageSize) {
                if (currentPage === 1) {
                    return {

                        image: letterhead,
                        width: 600,
                        absolutePosition: { x: 0, y: 0 },
                        opacity: 1,
                    };
                } else {
                    return {
                        pageMargins: [40, 100, 40, 100],
                        image: watermark,
                        width: 300,
                        absolutePosition: {
                            x: (pageSize.width - 200) / 2,
                            y: (pageSize.height - 200) / 2
                        },
                        opacity: 0.1,
                    };
                }
            },
            content: [
                {
                    margin: [0, 0, 0, 0],
                    style: 'tableExample',
                    table: {
                        widths: [350, '*', '*'],
                        body: [
                            [
                                {
                                    rowSpan: 3,
                                    fontSize: 10,
                                    text: `Booking Name: ${params.booking_name}\nQuotation No: ${params.quotation_no}\nQuotation Date: ${params.quotation_date}`
                                },
                                {
                                    colSpan: 2,
                                    rowSpan: 3,
                                    fontSize: 10,
                                    text: `Specials Name: ${params.specials_name}\nEvent Name: ${params.event_name}`
                                },
                                {}
                            ],
                            [
                                {},
                                {},
                                {}
                            ],
                            [
                                {},
                                {},
                                {}
                            ],
                        ]
                    }
                },
                {
                    margin: [0, 0, 0, 0],
                    fontSize: 10,
                    table: {
                        widths: ["100%"],
                        body: [
                            [ { text: `Email :${params.email_id} \nMobile No:${params.mobile_no}
                                Date Of Event: ${params.event_date}\nTime Of Event:${params.event_time}
                                Event Location: ${params.event_location}\nHome Address: ${params.home_address} `, },
                            ],
                        ],
                    },
                },
                {
                    margin: [0, 0, 0, 0],
                    table: {
                        widths: ["*"], // "*" ensures the column takes up all available space
                        body: [
                            [
                                {
                                    text: "PHOTOGRAPHY SERVICE’S",
                                    alignment: "center", // Center-align the text
                                    bold: true,          // Make the text bold
                                    fontSize: 12        // Set font size
                                }
                            ],
                        ],
                    },
                    layout: "noBorders", // Remove table borders if needed
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ["5%", "20%", "35%","15%","5%", "10%", "10%"],
                        body: serviceTableBody,
                    },
                },
                {
                    margin: [0, 0, 0, 20],
                    table: {
                        widths: ["80%", "20%"],
                        body: [
                            [
                                { text: "Gross Cost", alignment: "right", bold: true, fontSize: 10, },
                                { text: params.subtotal, alignment: "right", fontSize: 10, },
                            ],
                            [
                                { text: "Discount", alignment: "right", bold: true, fontSize: 10, },
                                {
                                    text: `(${params.discount}%)    -${params.discountamnt}`,
                                    alignment: "right", fontSize: 10,
                                },
                            ],
                            [
                                { text: "GST", alignment: "right", bold: true, fontSize: 10, },
                                { text: params.gst, alignment: "right", fontSize: 10, },
                            ],
                            [
                                { text: "Net Cost", alignment: "right", bold: true, fontSize: 10, },
                                { text: params.finalTotal, alignment: "right", fontSize: 10, },
                            ],
                        ],
                    },
                },
                {
                    text: '(BY USING OUR SERVICES, YOU AGREE TO BE BOUND OUR TERMS AND CONDITIONS.)',
                    fontSize: 10,
                    alignment: 'center',
                    italics: true,
                    color: 'red',
                    pageBreak: 'before',
                    margin: [0, -50, 0, 10]
                },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['20%', '40%', '20%', '20%'],
                        body: [
                            [
                                { text: 'Sr. No', bold: true, alignment: 'center', color: 'red', fontSize: 10 },
                                { text: 'PAYMENT PROCEDURE', bold: true, alignment: 'center', color: 'green', fontSize: 10 },
                                { text: 'AMOUNT', bold: true, alignment: 'center', color: 'blue', fontSize: 10 },
                                { text: 'DUE DATE', bold: true, alignment: 'center', color: 'red', fontSize: 10 },
                            ],
                            [
                                { text: '1)', alignment: 'left', fontSize: 10 },
                                { text: '10% ADVANCE PAYMENT OF TOTAL NET SERVICE COST', alignment: 'left', fontSize: 10 },
                                { text: `${part1_10}`, alignment: 'right', fontSize: 10 },
                                { text: paidText1, alignment: 'right', fontSize: 10 },
                            ],
                            [
                                { text: '2)', alignment: 'left', fontSize: 10 },
                                { text: '40% OF TOTAL NET SERVICE COST ON EVENT DAY', alignment: 'left', fontSize: 10 },
                                { text: `${part2_40}`, alignment: 'right', fontSize: 10 },
                                { text: paidText2, alignment: 'right', fontSize: 10 },
                            ],
                            [
                                { text: '2)', alignment: 'left', fontSize: 10 },
                                { text: '50% OF TOTAL NET SERVICE COST ON EVENT DAY', alignment: 'left', fontSize: 10 },
                                { text: `${part3_50}`, alignment: 'right', fontSize: 10 },
                                { text: paidText2, alignment: 'right', fontSize: 10 },
                            ],
                        ]
                    }
                },
                { text: '', margin: [20, 20, 20, 0] },
                {
                    image: bankdetailImage, // or provide the image URL
                    width: 540, // Adjust the image width as needed
                    height: 200, // Adjust the image height as needed
                    alignment: 'center', // Adjust alignment as needed
                    margin: [0, 0] // Margin to add space around the image if needed
                },


            ],
        };

        const pdfDoc = printer.createPdfKitDocument(dd);

        // Convert stream to buffer
        const chunks = [];
        pdfDoc.on('data', chunk => chunks.push(chunk));
        pdfDoc.on('end', () => null);
        pdfDoc.end();

        return new Promise((resolve, reject) => {
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
        });
    } catch (error) {
        console.error(error);
        throw new Error('Error generating PDF');
    }
};

exports.create_50_50_packagepdf = async (pdfdata) => {
    try {
        const printer = new PdfPrinter(fonts);
        const { params, serviceitems,paymentstatus } = pdfdata;
        // 50-50 Split
        const part1_50_50 = params.finalTotal * 0.50;
        const part2_50_50 = params.finalTotal * 0.50;
        
        
        const paidText1 = paymentstatus[0] && paymentstatus[0].isPaid
        ? `Paid  ${paymentstatus[0].paymentDate}`
        : paymentstatus[0] ? `Pending  ${paymentstatus[0].paymentDate}` : 'No Data';
        
        const paidText2 = paymentstatus[1] && paymentstatus[1].isPaid
        ? `Paid  ${paymentstatus[1].paymentDate}`
        : paymentstatus[1] ? `Pending  ${paymentstatus[1].paymentDate}` : 'No Data';
        
        
        const tableHeaders = [
            { text: "Sr No", bold: true, alignment: "center", fontSize: 10, },
            { text: "Service Name", bold: true, alignment: "center", fontSize: 10, },
            { text: "Description", bold: true, alignment: "center", fontSize: 10, },
            { text: "Date", bold: true, alignment: "center", fontSize: 10, },
            { text: "QTY", bold: true, alignment: "center", fontSize: 10, },
            { text: "Discount", bold: true, alignment: "center", fontSize: 10, },
            { text: "Total AMT", bold: true, alignment: "center", fontSize: 10, },
        ];
        
        console.log("im here create_50_50_pdf")
        
        const serviceRows = serviceitems.map((item, index) => [
            { text: index + 1, alignment: "center", fontSize: 10, },
            { text: `${item.name}/${item.subname}`, color: "red", alignment: "center", fontSize: 10, },
            { text: item.detailed_description, alignment: "center", fontSize: 10, },
            { text: item.date, alignment: "center", fontSize: 10, },
            { text: item.quantity, alignment: "center", fontSize: 10, },
            { text: params.discount ? `${params.discount}%` : "-", alignment: "center", fontSize: 10, },
            { text: item.quantity * item.retail_price, alignment: "right", fontSize: 10, }, // Calculate total for each row
        ]);
        
        const serviceTableBody = [tableHeaders, ...serviceRows];

        let dd = {
            pageMargins: [40, 150, 40, 100],

            background: function (currentPage, pageSize) {
                if (currentPage === 1) {
                    return {

                        image: letterhead,
                        width: 600,
                        absolutePosition: { x: 0, y: 0 },
                        opacity: 1,
                    };
                } else {
                    return {
                        pageMargins: [40, 100, 40, 100],
                        image: watermark,
                        width: 300,
                        absolutePosition: {
                            x: (pageSize.width - 200) / 2,
                            y: (pageSize.height - 200) / 2
                        },
                        opacity: 0.1,
                    };
                }
            },
            content: [
                {
                    margin: [0, 0, 0, 0],
                    style: 'tableExample',
                    table: {
                        widths: [350, '*', '*'],
                        body: [
                            [
                                {
                                    rowSpan: 3,
                                    fontSize: 10,
                                    text: `Booking Name: ${params.booking_name}\nQuotation No: ${params.quotation_no}\nQuotation Date: ${params.quotation_date}`
                                },
                                {
                                    colSpan: 2,
                                    rowSpan: 3,
                                    fontSize: 10,
                                    text: `Specials Name: ${params.specials_name}\nEvent Name: ${params.event_name}`
                                },
                                {}
                            ],
                            [
                                {},
                                {},
                                {}
                            ],
                            [
                                {},
                                {},
                                {}
                            ],
                        ]
                    }
                },
                {
                    margin: [0, 0, 0, 0],
                    fontSize: 10,
                    table: {
                        widths: ["100%"],
                        body: [
                            [ { text: `Email :${params.email_id} \nMobile No:${params.mobile_no}
                                Date Of Event: ${params.event_date}\nTime Of Event:${params.event_time}
                                Event Location: ${params.event_location}\nHome Address: ${params.home_address} `, },
                            ],
                        ],
                    },
                },
                {
                    margin: [0, 0, 0, 0],
                    table: {
                        widths: ["*"], // "*" ensures the column takes up all available space
                        body: [
                            [
                                {
                                    text: "PHOTOGRAPHY SERVICE’S",
                                    alignment: "center", // Center-align the text
                                    bold: true,          // Make the text bold
                                    fontSize: 12        // Set font size
                                }
                            ],
                        ],
                    },
                    layout: "noBorders", // Remove table borders if needed
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ["5%", "20%", "35%","15%","5%", "10%", "10%"],
                        body: serviceTableBody,
                    },
                },
                {
                    margin: [0, 0, 0, 20],
                    table: {
                        widths: ["80%", "20%"],
                        body: [
                            [
                                { text: "Gross Cost", alignment: "right", bold: true, fontSize: 10, },
                                { text: params.subtotal, alignment: "right", fontSize: 10, },
                            ],
                            [
                                { text: "Discount", alignment: "right", bold: true, fontSize: 10, },
                                {
                                    text: `(${params.discount}%)    -${params.discountamnt}`,
                                    alignment: "right", fontSize: 10,
                                },
                            ],
                            [
                                { text: "GST", alignment: "right", bold: true, fontSize: 10, },
                                { text: params.gst, alignment: "right", fontSize: 10, },
                            ],
                            [
                                { text: "Net Cost", alignment: "right", bold: true, fontSize: 10, },
                                { text: params.finalTotal, alignment: "right", fontSize: 10, },
                            ],
                        ],
                    },
                },
                {
                    text: '(BY USING OUR SERVICES, YOU AGREE TO BE BOUND OUR TERMS AND CONDITIONS.)',
                    fontSize: 10,
                    alignment: 'center',
                    italics: true,
                    color: 'red',
                    pageBreak: 'before',
                    margin: [0, -50, 0, 10]
                },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['20%', '40%', '20%', '20%'],
                        body: [
                            [
                                { text: 'Sr. No', bold: true, alignment: 'center', color: 'red', fontSize: 10 },
                                { text: 'PAYMENT PROCEDURE', bold: true, alignment: 'center', color: 'green', fontSize: 10 },
                                { text: 'AMOUNT', bold: true, alignment: 'center', color: 'blue', fontSize: 10 },
                                { text: 'DUE DATE', bold: true, alignment: 'center', color: 'red', fontSize: 10 },
                            ],
                            [
                                { text: '1)', alignment: 'left', fontSize: 10 },
                                { text: '   50% ADVANCE PAYMENT OF TOTAL NET SERVICE COST', alignment: 'left', fontSize: 10 },
                                { text: `${part1_50_50}`, alignment: 'right', fontSize: 10 },
                                { text: paidText1, alignment: 'right', fontSize: 10 },
                            ],
                            [
                                { text: '2)', alignment: 'left', fontSize: 10 },
                                { text: '50% OF TOTAL NET SERVICE COST ON EVENT DAY', alignment: 'left', fontSize: 10 },
                                { text: `${part1_50_50}`, alignment: 'right', fontSize: 10 },
                                { text: paidText2, alignment: 'right', fontSize: 10 },
                            ],
                        ]
                    }
                },
                { text: '', margin: [20, 20, 20, 0] },
                {
                    image: bankdetailImage, // or provide the image URL
                    width: 540, // Adjust the image width as needed
                    height: 200, // Adjust the image height as needed
                    alignment: 'center', // Adjust alignment as needed
                    margin: [0, 0] // Margin to add space around the image if needed
                },


            ],
        };

        const pdfDoc = printer.createPdfKitDocument(dd);

        // Convert stream to buffer
        const chunks = [];
        pdfDoc.on('data', chunk => chunks.push(chunk));
        pdfDoc.on('end', () => null);
        pdfDoc.end();

        return new Promise((resolve, reject) => {
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
        });
    } catch (error) {
        console.error(error);
        throw new Error('Error generating PDF');
    }
};

exports.create_10_40_50_Packagepdf = async (pdfdata) => {
    try {
        const printer = new PdfPrinter(fonts);

        const { params, serviceitems,finalTotal,  } = pdfdata;

        // 10-40-50 Split
        const part1_10 = params.finalTotal * 0.10;
        const part2_40 = params.finalTotal * 0.40;
        const part3_50 = params.finalTotal * 0.50;

        const paidText1 = params.paymentstatus && params.paymentstatus[0]
        ? params.paymentstatus[0].isPaid
            ? `Paid ${params.paymentstatus[0].paymentDate}`
            : `Pending ${params.paymentstatus[0].paymentDate}`
        : 'No Data';
    
    const paidText2 = params.paymentstatus && params.paymentstatus[1]
        ? params.paymentstatus[1].isPaid
            ? `Paid ${params.paymentstatus[1].paymentDate}`
            : `Pending ${params.paymentstatus[1].paymentDate}`
        : 'No Data';
    
    const paidText3 = params.paymentstatus && params.paymentstatus[2]
        ? params.paymentstatus[2].isPaid
            ? `Paid ${params.paymentstatus[2].paymentDate}`
            : `Pending ${params.paymentstatus[2].paymentDate}`
        : 'No Data';
    

        // Create table headers
        const tableHeaders = [
            { text: "Sr No", bold: true, alignment: "center", fontSize: 10, },
            { text: "Service Name", bold: true, alignment: "center", fontSize: 10, },
            { text: "Description", bold: true, alignment: "center", fontSize: 10, },
            { text: "Date", bold: true, alignment: "center", fontSize: 10, },
            { text: "QTY", bold: true, alignment: "center", fontSize: 10, },
            { text: "Discount", bold: true, alignment: "center", fontSize: 10, },
            { text: "Total AMT", bold: true, alignment: "center", fontSize: 10, },
        ];


        const serviceRows = serviceitems.map((item, index) => [
            { text: index + 1, alignment: "center", fontSize: 10, },
            { text: `${item.name}/${item.subname}`, color: "red", alignment: "center", fontSize: 10, },
            { text: item.detailed_description, alignment: "center", fontSize: 10, },
            { text: item.date, alignment: "center", fontSize: 10, },
            { text: item.quantity, alignment: "center", fontSize: 10, },
            { text: params.discount ? `${params.discount}%` : "-", alignment: "center", fontSize: 10, },
            { text: item.quantity * item.retail_price, alignment: "right", fontSize: 10, }, // Calculate total for each row
        ]);

        const serviceTableBody = [tableHeaders, ...serviceRows];

        let dd = {
            pageMargins: [40, 150, 40, 100],

            background: function (currentPage, pageSize) {
                if (currentPage === 1) {
                    return {

                        image: letterhead,
                        width: 600,
                        absolutePosition: { x: 0, y: 0 },
                        opacity: 1,
                    };
                } else {
                    return {
                        pageMargins: [40, 100, 40, 100],
                        image: watermark,
                        width: 300,
                        absolutePosition: {
                            x: (pageSize.width - 200) / 2,
                            y: (pageSize.height - 200) / 2
                        },
                        opacity: 0.1,
                    };
                }
            },
            content: [
                {
                    margin: [0, 0, 0, 0],
                    style: 'tableExample',
                    table: {
                        widths: [350, '*', '*'],
                        body: [
                            [
                                {
                                    rowSpan: 3,
                                    fontSize: 10,
                                    text: `Booking Name: ${params.booking_name}\nQuotation No: ${params.quotation_no}\nQuotation Date: ${params.quotation_date}`
                                },
                                {
                                    colSpan: 2,
                                    rowSpan: 3,
                                    fontSize: 10,
                                    text: `Specials Name: ${params.specials_name}\nEvent Name: ${params.event_name}`
                                },
                                {}
                            ],
                            [
                                {},
                                {},
                                {}
                            ],
                            [
                                {},
                                {},
                                {}
                            ],
                        ]
                    }
                },
                {
                    margin: [0, 0, 0, 0],
                    fontSize: 10,
                    table: {
                        widths: ["100%"],
                        body: [
                            [ { text: `Email :${params.email_id} \nMobile No:${params.mobile_no}
                                Date Of Event: ${params.event_date}\nTime Of Event:${params.event_time}
                                Event Location: ${params.event_location}\nHome Address: ${params.home_address} `, },
                            ],
                        ],
                    },
                },
                {
                    margin: [0, 0, 0, 0],
                    table: {
                        widths: ["*"], // "*" ensures the column takes up all available space
                        body: [
                            [
                                {
                                    text: "PHOTOGRAPHY SERVICE’S",
                                    alignment: "center", // Center-align the text
                                    bold: true,          // Make the text bold
                                    fontSize: 12        // Set font size
                                }
                            ],
                        ],
                    },
                    layout: "noBorders", // Remove table borders if needed
                },
                {
                    table: {
                        headerRows: 1,
                        widths: ["5%", "20%", "35%","15%","5%", "10%", "10%"],
                        body: serviceTableBody,
                    },
                },
                {
                    margin: [0, 0, 0, 20],
                    table: {
                        widths: ["80%", "20%"],
                        body: [
                            [
                                { text: "Gross Cost", alignment: "right", bold: true, fontSize: 10, },
                                { text: params.subtotal, alignment: "right", fontSize: 10, },
                            ],
                            [
                                { text: "Discount", alignment: "right", bold: true, fontSize: 10, },
                                {
                                    text: `(${params.discount}%)    -${params.discountamnt}`,
                                    alignment: "right", fontSize: 10,
                                },
                            ],
                            [
                                { text: "GST", alignment: "right", bold: true, fontSize: 10, },
                                { text: params.gst, alignment: "right", fontSize: 10, },
                            ],
                            [
                                { text: "Net Cost", alignment: "right", bold: true, fontSize: 10, },
                                { text: params.finalTotal, alignment: "right", fontSize: 10, },
                            ],
                        ],
                    },
                },
                {
                    text: '(BY USING OUR SERVICES, YOU AGREE TO BE BOUND OUR TERMS AND CONDITIONS.)',
                    fontSize: 10,
                    alignment: 'center',
                    italics: true,
                    color: 'red',
                    pageBreak: 'before',
                    margin: [0, -50, 0, 10]
                },
                {
                    style: 'tableExample',
                    table: {
                        widths: ['20%', '40%', '20%', '20%'],
                        body: [
                            [
                                { text: 'Sr. No', bold: true, alignment: 'center', color: 'red', fontSize: 10 },
                                { text: 'PAYMENT PROCEDURE', bold: true, alignment: 'center', color: 'green', fontSize: 10 },
                                { text: 'AMOUNT', bold: true, alignment: 'center', color: 'blue', fontSize: 10 },
                                { text: 'DUE DATE', bold: true, alignment: 'center', color: 'red', fontSize: 10 },
                            ],
                            [
                                { text: '1)', alignment: 'left', fontSize: 10 },
                                { text: '10% ADVANCE PAYMENT OF TOTAL NET SERVICE COST', alignment: 'left', fontSize: 10 },
                                { text: `${part1_10}`, alignment: 'right', fontSize: 10 },
                                { text: paidText1, alignment: 'right', fontSize: 10 },
                            ],
                            [
                                { text: '2)', alignment: 'left', fontSize: 10 },
                                { text: '40% OF TOTAL NET SERVICE COST ON EVENT DAY', alignment: 'left', fontSize: 10 },
                                { text: `${part2_40}`, alignment: 'right', fontSize: 10 },
                                { text: paidText2, alignment: 'right', fontSize: 10 },
                            ],
                            [
                                { text: '2)', alignment: 'left', fontSize: 10 },
                                { text: '50% OF TOTAL NET SERVICE COST ON EVENT DAY', alignment: 'left', fontSize: 10 },
                                { text: `${part3_50}`, alignment: 'right', fontSize: 10 },
                                { text: paidText2, alignment: 'right', fontSize: 10 },
                            ],
                        ]
                    }
                },
                { text: '', margin: [20, 20, 20, 0] },
                {
                    image: bankdetailImage, // or provide the image URL
                    width: 540, // Adjust the image width as needed
                    height: 200, // Adjust the image height as needed
                    alignment: 'center', // Adjust alignment as needed
                    margin: [0, 0] // Margin to add space around the image if needed
                },


            ],
        };

        const pdfDoc = printer.createPdfKitDocument(dd);

        // Convert stream to buffer
        const chunks = [];
        pdfDoc.on('data', chunk => chunks.push(chunk));
        pdfDoc.on('end', () => null);
        pdfDoc.end();

        return new Promise((resolve, reject) => {
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
        });
    } catch (error) {
        console.error(error);
        throw new Error('Error generating PDF');
    }
};