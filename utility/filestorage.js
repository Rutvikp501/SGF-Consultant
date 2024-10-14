const multer = require("multer");
const path = require("path");

// Set up storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");  // Files will be saved in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Add timestamp to avoid name collisions
    }
});

// File filter to allow only images and PDFs
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".pdf") {
        cb(null, true);
    } else {
        cb(new Error("Only images or PDFs are allowed!"), false);
    }
};

// Multer configuration to handle multiple files
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 10 }, // Limit file size to 10MB
    fileFilter: fileFilter
});
