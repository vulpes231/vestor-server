const multer = require("multer");
const path = require("path");
const Verification = require("../../models/Verification");

// Set up Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
}).single("idImage");

const requestVerification = async (req, res) => {
  const userId = req.userId;
  const { idNumber, idType } = req.body;

  if (!idNumber || !idType) {
    return res.status(400).json({ message: "Bad request!" });
  }

  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    try {
      const storedImage = req.file.path;

      const verifyData = { idNumber, idType, imagePath: storedImage, userId };
      await Verification.verifyAccount(verifyData);

      return res
        .status(200)
        .json({ message: "Verification request submitted successfully!" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
};

const getVerifyData = async (req, res) => {
  const userId = req.userId;
  try {
    await Verification.getUserVerifyData(userId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { requestVerification, getVerifyData };
