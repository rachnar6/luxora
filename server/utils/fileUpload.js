// server/utils/fileUpload.js
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url'; // For ES modules

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure this path exists relative to your server.js
        cb(null, path.join(__dirname, '../public/uploads/profile_pictures'));
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const checkFileType = (file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
};

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    },
    limits: { fileSize: 2 * 1024 * 1024 } // 2MB file size limit
});

export default upload;