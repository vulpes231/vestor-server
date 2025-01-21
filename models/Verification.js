const { Schema, default: mongoose } = require("mongoose");
const User = require("./User");

const verificationSchema = new Schema({
  idNumber: {
    type: String,
    required: true,
  },
  idType: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
  },
  dob: {
    type: String,
  },
  employment: {
    type: String,
  },
  status: {
    type: String,
    default: "pending",
  },
  initiator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

verificationSchema.statics.verifyAccount = async function (verifyData) {
  try {
    const user = await User.findById(verifyData.userId);
    if (!user) {
      throw new Error("Invalid userId");
    }

    const pendingRequest = await Verification.findOne({ initiator: user._id });
    if (pendingRequest) {
      throw new Error("Request already submitted!");
    }
    const verificationData = {
      idNumber: verifyData.idNumber,
      idType: verifyData.idType,
      imagePath: verifyData.imagePath,
      dob: verifyData.dob,
      employment: verifyData.employment,
      initiator: user._id,
    };

    const userVerify = await Verification.create(verificationData);
    return userVerify;
  } catch (error) {
    throw error;
  }
};

verificationSchema.statics.approveAccount = async function (verifyData) {
  try {
    const user = await User.findById(verifyData.userId);
    if (!user) {
      throw new Error("Invalid userId");
    }
    if (user.isKYCVerified) {
      throw new Error("User already verified!");
    }

    const verifyRequest = await Verification.findById(verifyData.verifyId);
    if (!verifyRequest) {
      throw new Error("Invalid Verification request ID!");
    }
    verifyRequest.status = "verified";
    await verifyRequest.save();

    user.isKYCVerified = true;
    await user.save();

    return verifyRequest;
  } catch (error) {
    throw error;
  }
};

verificationSchema.statics.rejectAccount = async function (verifyData) {
  try {
    const user = await User.findById(verifyData.userId);
    if (!user) {
      throw new Error("Invalid userId");
    }

    const verifyRequest = await Verification.findById(verifyData.verifyId);
    if (!verifyRequest) {
      throw new Error("Invalid Verification request ID!");
    }
    verifyRequest.status = "failed";
    await verifyRequest.save();
    return verifyRequest;
  } catch (error) {
    throw error;
  }
};

verificationSchema.statics.getVerifications = async function () {
  try {
    const verifications = await Verification.find();
    return verifications;
  } catch (error) {
    throw error;
  }
};

verificationSchema.statics.getUserVerifyData = async function (userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("Invalid userId");
    }

    const userVerifyData = await Verification.findOne({ initiator: user._id });
    if (!userVerifyData) {
      throw new Error("No submitted request!");
    }

    return userVerifyData;
  } catch (error) {
    throw error;
  }
};

const Verification = mongoose.model("Verification", verificationSchema);
module.exports = Verification;
