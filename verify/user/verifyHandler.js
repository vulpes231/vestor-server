const Verification = require("../../models/Verification");

// The request verification handler
const requestVerification = async (req, res) => {
  const userId = req.userId;
  const { idNumber, idType, dob, employment } = req.body;

  // console.log("req.body:", req.body);

  if (!idNumber || !idType || !dob || !employment) {
    return res.status(400).json({ message: "Bad request!" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded!" });
  }

  try {
    const storedImage = req.file.path;

    console.log(storedImage);

    const verifyData = {
      idNumber,
      idType,
      imagePath: storedImage,
      userId,
      dob,
      employment,
    };

    await Verification.verifyAccount(verifyData);

    return res
      .status(200)
      .json({ message: "Verification request submitted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
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
