import multer from 'multer';

// Cấu hình Multer
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ file .xlsx!') as any, false);
    }
  },
});

export default upload;