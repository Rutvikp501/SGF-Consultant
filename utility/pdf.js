const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { read_image } = require("../helpers/common");
const {create_50_50_pdf ,create_10_40_50_pdf} = require('../helpers/pdfhelper');

exports.create_proforma = async (pdfdata) => {
    
  try {
    let pdfBuffer;
    let  t_c_PdfPath;
    // Step 1: Generate the dynamically created Proforma PDF
    if (pdfdata.params.format == '50-50') {
      console.log("im here 50-50");
      pdfBuffer = await create_50_50_pdf(pdfdata); // For 50-50 payment structure
    } else if (pdfdata.params.format == '10-40-50') {
        pdfBuffer = await create_10_40_50_pdf(pdfdata); // For 10-40-50 payment structure
    } else {
        throw new Error('Unsupported payment structure');
    }
    const proformaPdfDoc = await PDFDocument.load(pdfBuffer);
    // Step 2: Load the T&C PDF from the filesystem
    if (pdfdata.params.service_type === 'film_service') {
            t_c_PdfPath = path.join(__dirname, `../assets/pdf/PHOTOGRAPHY SERVICE’S T&C.pdf`);
    } else if (pdfdata.params.service_type === 'album_service') {
        t_c_PdfPath = path.join(__dirname, `../assets/pdf/PHOTOGRAPHY SERVICE’S T&C.pdf`);
    } else {
        throw new Error('Unsupported Service Type');
    }
    const  t_c_PdfBytes = fs.readFileSync( t_c_PdfPath); 
    const  t_c_PdfDoc = await PDFDocument.load( t_c_PdfBytes);

    // Step 3: Create a new PDF document and merge both PDFs
    const mergedPdfDoc = await PDFDocument.create();

    // Copy pages from the Proforma PDF
    const proformaPages = await mergedPdfDoc.copyPages(proformaPdfDoc, proformaPdfDoc.getPageIndices());
    proformaPages.forEach((page) => mergedPdfDoc.addPage(page));

    // Copy pages from the T&C PDF
    const t_c_Pages = await mergedPdfDoc.copyPages( t_c_PdfDoc,  t_c_PdfDoc.getPageIndices());
     t_c_Pages.forEach((page) => mergedPdfDoc.addPage(page));

    // Step 4: Save and return the merged PDF as a Buffer
    const mergedPdfBuffer = await mergedPdfDoc.save();
    return mergedPdfBuffer;

  } catch (error) {
    console.error('Error generating or merging PDF:', error);
    throw new Error('Error generating Proforma PDF with T&C!');
  }
};
