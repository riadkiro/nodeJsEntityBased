const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
const MAX_IMAGES_PER_UPLOAD = 10;
const MAX_VISION_IMAGE_SIZE = 8 * 1024 * 1024;
const MAX_VISION_TOTAL_SIZE = 16 * 1024 * 1024;
const allowedExtensions = new Set([
    '.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif',
]);
const allowedMimeTypes = new Set([
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif',
    'application/octet-stream',
]);

function cleanSegment(value, fallback = 'image') {
    const base = path.basename(String(value || fallback));
    const cleaned = base
        .normalize('NFKC')
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 160);
    return cleaned || fallback;
}

function accountBase(accountNumber) {
    return path.resolve(
        __dirname,
        '../private_uploads/attachments',
        String(accountNumber || ''),
    );
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadId = crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const taskId = /^[a-f\d]{24}$/i.test(String(req.params.taskId || ''))
            ? String(req.params.taskId)
            : 'unknown-task';
        const directory = path.join(
            accountBase(req.account_number),
            'tasks',
            taskId,
            uploadId,
        );
        fs.mkdirSync(directory, { recursive: true });
        cb(null, directory);
    },
    filename: (req, file, cb) => {
        const originalName = cleanSegment(file.originalname, 'image.jpg');
        const extension = path.extname(originalName).toLowerCase();
        file.originalname = originalName;
        cb(null, `image-${Date.now()}${extension || '.jpg'}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: MAX_IMAGE_SIZE,
        files: MAX_IMAGES_PER_UPLOAD,
    },
    fileFilter: (req, file, cb) => {
        const originalName = cleanSegment(file.originalname, 'image.jpg');
        const extension = path.extname(originalName).toLowerCase();
        const mimeType = String(file.mimetype || '').toLowerCase();
        if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(mimeType)) {
            return cb(new Error('Seules les images JPG, PNG, WEBP, HEIC et HEIF sont acceptées'));
        }
        file.originalname = originalName;
        cb(null, true);
    },
});

function relativePath(req, filePath) {
    const base = accountBase(req.account_number);
    const absolute = path.resolve(filePath);
    if (!absolute.startsWith(base + path.sep)) return '';
    return path.relative(base, absolute).split(path.sep).join('/');
}

function resolvePath(accountNumber, filename) {
    if (!filename || String(filename).includes('..')) return null;
    const base = accountBase(accountNumber);
    const target = path.resolve(base, String(filename));
    return target.startsWith(base + path.sep) ? target : null;
}

function removeFile(accountNumber, filename) {
    const target = resolvePath(accountNumber, filename);
    if (!target || !fs.existsSync(target)) return;
    fs.rmSync(target, { force: true });
    const base = accountBase(accountNumber);
    let current = path.dirname(target);
    while (current.startsWith(base + path.sep) && current !== base) {
        try {
            if (fs.readdirSync(current).length > 0) break;
            fs.rmdirSync(current);
            current = path.dirname(current);
        } catch (_) {
            break;
        }
    }
}

function cleanupRequestFiles(req) {
    (req.files || []).forEach(file => {
        const filename = relativePath(req, file.path);
        if (filename) removeFile(req.account_number, filename);
    });
}

function uploadImages(req, res, next) {
    upload.array('images', MAX_IMAGES_PER_UPLOAD)(req, res, error => {
        if (!error) return next();
        cleanupRequestFiles(req);
        return res.status(400).json({
            success: false,
            error: error.message || 'Upload des images impossible',
        });
    });
}

function attachmentFromFile(req, file, userId) {
    const filename = relativePath(req, file.path);
    if (!filename) return null;
    const extension = path.extname(file.originalname || file.filename).toLowerCase();
    const mimeByExtension = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.heic': 'image/heic',
        '.heif': 'image/heif',
    };
    return {
        filename,
        originalName: cleanSegment(file.originalname, file.filename),
        mimeType: mimeByExtension[extension] || file.mimetype || '',
        size: Number(file.size || 0),
        uploadedAt: new Date(),
        uploadedBy: userId,
    };
}

function isImageAttachment(attachment) {
    const mimeType = String(attachment?.mimeType || '').toLowerCase();
    const extension = path.extname(
        String(attachment?.originalName || attachment?.filename || ''),
    ).toLowerCase();
    return mimeType.startsWith('image/') || allowedExtensions.has(extension);
}

function visionContent(accountNumber, attachments = [], options = {}) {
    const maxImages = Math.min(10, Math.max(1, Number(options.maxImages || 4)));
    const maxImageBytes = Math.min(
        MAX_IMAGE_SIZE,
        Math.max(1024, Number(options.maxImageBytes || MAX_VISION_IMAGE_SIZE)),
    );
    const maxTotalBytes = Math.max(
        maxImageBytes,
        Number(options.maxTotalBytes || MAX_VISION_TOTAL_SIZE),
    );
    const result = [];
    let totalBytes = 0;

    for (const attachment of attachments || []) {
        if (result.length >= maxImages || totalBytes >= maxTotalBytes) break;
        if (!isImageAttachment(attachment)) continue;
        const mimeType = visionMimeType(attachment.mimeType, attachment.originalName || attachment.filename);
        if (!mimeType) continue;
        const target = resolvePath(accountNumber, attachment.filename);
        if (!target || !fs.existsSync(target)) continue;

        try {
            const stats = fs.statSync(target);
            if (!stats.isFile() || stats.size <= 0 || stats.size > maxImageBytes) continue;
            if (totalBytes + stats.size > maxTotalBytes) continue;
            const buffer = fs.readFileSync(target);
            result.push({
                type: 'input_image',
                image_url: `data:${mimeType};base64,${buffer.toString('base64')}`,
                detail: options.detail === 'low' ? 'low' : 'high',
            });
            totalBytes += buffer.length;
        } catch (_) {}
    }

    return result;
}

function visionMimeType(rawMime, filename) {
    const mimeType = String(rawMime || '').toLowerCase();
    if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(mimeType)) {
        return mimeType;
    }
    const extension = path.extname(String(filename || '')).toLowerCase();
    if (['.jpg', '.jpeg'].includes(extension)) return 'image/jpeg';
    if (extension === '.png') return 'image/png';
    if (extension === '.webp') return 'image/webp';
    if (extension === '.gif') return 'image/gif';
    return '';
}

module.exports = {
    uploadImages,
    attachmentFromFile,
    cleanupRequestFiles,
    removeFile,
    resolvePath,
    isImageAttachment,
    visionContent,
};
