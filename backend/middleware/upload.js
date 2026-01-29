import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chat attachments directory
const uploadDir = path.join(__dirname, '../uploads/chat-attachments');
console.log('📁 Resolving chat upload directory at:', uploadDir);

if (!fs.existsSync(uploadDir)) {
    console.log('📁 Directory missing, creating...');
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('✅ Directory created success!');
}

// Product images directory
const productUploadDir = path.join(__dirname, '../uploads/products');
console.log('📁 Resolving product upload directory at:', productUploadDir);

if (!fs.existsSync(productUploadDir)) {
    console.log('📁 Product directory missing, creating...');
    fs.mkdirSync(productUploadDir, { recursive: true });
    console.log('✅ Product directory created success!');
}

// Avatar images directory
const avatarUploadDir = path.join(__dirname, '../uploads/avatars');
console.log('📁 Resolving avatar upload directory at:', avatarUploadDir);

if (!fs.existsSync(avatarUploadDir)) {
    console.log('📁 Avatar directory missing, creating...');
    fs.mkdirSync(avatarUploadDir, { recursive: true });
    console.log('✅ Avatar directory created success!');
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('📥 Start uploading file:', file.originalname);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png, gif, webp) and documents (pdf, doc, docx, zip) are allowed!'));
    }
};

// Configure multer for chat
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Product image storage configuration
const productStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('📥 Start uploading product image:', file.originalname);
        cb(null, productUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Avatar storage configuration
const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, avatarUploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Product image file filter (only images)
const productFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
};

// Configure multer for product images
export const uploadProductImages = multer({
    storage: productStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit per file
    },
    fileFilter: productFileFilter
});

// Configure multer for avatars
export const uploadAvatar = multer({
    storage: avatarStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit for avatars
    },
    fileFilter: productFileFilter // Reuse the image-only filter
});

export default upload;
