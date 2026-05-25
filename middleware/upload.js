const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { normalizeUploadedFilename } = require("../utils/filename-encoding");

function uploadToDynamic(getFolder) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const folderPath = getFolder(req); // ex: 'public/2501/uploads'
      const fullPath = path.join(__dirname, "..", folderPath);

      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }

      cb(null, fullPath);
    },
    filename: function (req, file, cb) {
      file.originalname = normalizeUploadedFilename(file.originalname);
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  return multer({ storage });
}

module.exports = uploadToDynamic;
