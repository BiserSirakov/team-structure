import multer from 'multer';

/**
 * File upload handler. Uses multer. Sets file limit to 1MB and file type to JSON only.
 */
export default multer({
  limits: { fileSize: 1 * 1024 * 1024 }, // limit file size to 1MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Only .json allowed!'));
    }
  },
});
