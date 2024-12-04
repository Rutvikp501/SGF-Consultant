const path = require("path");
const fs = require("fs");
exports.read_image = (file_Path) => {
    const filePath = path.join(`${file_Path}`);
    const image = fs.readFileSync(filePath,);
    const imageBase = Buffer.from(image).toString('base64');
    const returnImg = `data:image/jpeg;base64,${imageBase}`;
    return returnImg;
}