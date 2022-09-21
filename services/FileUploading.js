const multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/files');
  },
  filename: function (req, file, cb) {
    const mimeType = file.originalname.split('.');
    const fileExtension = mimeType[mimeType.length - 1];

    const data = JSON.parse(req.body.data);
    cb(null, data.fName);
  },
});
const upload = multer({ storage: storage });
module.exports = { upload };
