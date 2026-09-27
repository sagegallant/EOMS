import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base upload directory inside server
export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/documents');

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Whitelist configuration
export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

export const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
]);

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
    cb(null, `doc-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    const error = new Error('INVALID_FILE_TYPE: Only PDF, PNG, JPG, and WebP files are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    return cb(error, false);
  }

  cb(null, true);
};

export const documentUpload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

/**
 * Validates and safely resolves path to a stored document file preventing path traversal
 */
export function getSafeFilePath(storedFilename) {
  if (!storedFilename) return null;
  // Extract strictly the base file name to prevent directory traversal
  const safeName = path.basename(storedFilename);
  const resolved = path.resolve(UPLOAD_DIR, safeName);

  // Security check: ensure path is within UPLOAD_DIR
  if (!resolved.startsWith(UPLOAD_DIR)) {
    throw new Error('SECURITY_ERROR: Directory traversal attempt detected.');
  }

  return resolved;
}
