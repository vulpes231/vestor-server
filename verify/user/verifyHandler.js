const Verification = require("../../models/Verification");

const requestVerification = async (req, res) => {
  const userId = req.userId;
  const { idNumber, idType, idImage } = req.body;

  if (!idNumber || !idType || !idImage)
    return res.status(400).json({ message: "Bad request!" });
  try {
    //process image with multer and store in uploads folder in root
    const storedImage = "";
    const verifyData = { idNumber, idType, imagePath, userId };
    await Verification.verifyAccount(verifyData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { requestVerification };
