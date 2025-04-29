const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../utils/mailer");
const { generateOTP } = require("../utils/generateCode");
require("dotenv");
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
Wallet = require("./Wallet");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    password: {
      type: String,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    country: {
      type: String,
      trim: true,
      required: true,
    },
    firstname: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
    },
    pin: {
      type: String,
      trim: true,
    },
    refreshToken: {
      type: String,
    },
    isKYCVerified: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    street: {
      type: String,
      trim: true,
    },
    apt: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zip: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
    },
    mailing: {
      type: String,
    },
    tax: {
      type: String,
    },
    idNumber: {
      type: String,
    },
    marital: {
      type: String,
    },
    dob: {
      type: String,
    },
    employment: {
      type: String,
    },
    walletDepositInfo: {
      btc: { type: String },
      ethErc: { type: String },
      ethArb: { type: String },
      usdtErc: { type: String },
      usdtTrc: { type: String },
    },
    bankDepositInfo: {
      bankName: { type: String },
      account: { type: String },
      routing: { type: String },
      address: { type: String },
      swift: { type: String },
    },
    canWithdraw: {
      type: Boolean,
      default: true,
    },
    customWithdrawalMsg: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// login user
userSchema.statics.loginUser = async function (loginData) {
  try {
    const user = await User.findOne({
      email: loginData.email,
    });

    if (!user) {
      throw new Error("User does not exist!");
    }

    // Ensure password matches
    const passwordMatch = await bcrypt.compare(
      loginData.password,
      user.password
    );
    if (!passwordMatch) {
      throw new Error("Invalid username or password!");
    }

    const subject = "Vestor Login OTP Code";
    const code = generateOTP();
    const message = `Your login verification code is ${code}`;
    await sendMail(user.email, subject, message);

    // Generate tokens
    const accessToken = jwt.sign(
      { username: user.username, userId: user._id },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { username: user.username, userId: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    return {
      accessToken,
      refreshToken,
      isProfileComplete: user.isProfileComplete,
      country: user.country,
      username: user.username,
      isBanned: user.isBanned,
      otpCode: code,
      isEmailVerified: user.isEmailVerified,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

userSchema.statics.logoutUser = async function (userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User does not exist!");
    }

    user.refreshToken = null;
    await user.save();
    return true;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while logging out.");
  }
};

// get user
userSchema.statics.getUser = async function (userId) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User does not exist!");
    }
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// edit user
userSchema.statics.editUser = async function (userId, userData) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User does not exist!");
    }
    if (userData.firstname) {
      user.firstname = userData.firstname;
    }
    if (userData.lastname) {
      user.lastname = userData.lastname;
    }
    if (userData.street) {
      user.street = userData.street;
    }
    if (userData.apt) {
      user.apt = userData.apt;
    }
    if (userData.city) {
      user.city = userData.city;
    }
    if (userData.state) {
      user.state = userData.state;
    }
    if (userData.zip) {
      user.zip = userData.zip;
    }
    if (userData.phone) {
      user.phone = userData.phone;
    }
    if (userData.marital) {
      user.marital = userData.marital;
    }
    if (userData.tax) {
      user.tax = userData.tax;
    }
    if (userData.dob) {
      user.dob = userData.dob;
    }
    if (userData.mailing) {
      user.mailing = userData.mailing;
    }
    if (userData.employment) {
      user.employment = userData.employment;
    }
    if (userData.id) {
      user.idNumber = userData.id;
    }
    user.isProfileComplete = true;
    await user.save();
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// register user
userSchema.statics.registerUser = async function (userData) {
  try {
    const userNameTaken = await User.findOne({
      username: userData.username,
    });
    if (userNameTaken) {
      throw new Error("Username taken!");
    }
    const emailTaken = await User.findOne({
      email: userData.email,
    });
    if (emailTaken) {
      throw new Error("Email registered!");
    }

    if (userData.password !== userData.confirmPassword) {
      throw new Error("Passwords do not match!");
    }

    const hashPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await User.create({
      username: userData.username,
      password: hashPassword,
      email: userData.email,
      country: userData.country,
    });

    const depositWallet = await Wallet.create({
      ownerId: newUser._id,
      walletName: "Deposit",
    });

    const investWallet = await Wallet.create({
      ownerId: newUser._id,
      walletName: "Invest",
    });

    const subject = "Verify your email address";
    const code = generateOTP();
    const message = `Welcome ${newUser.username}, Thank you for joining Vestor Markets. Your email verification code is ${code}`;
    await sendMail(newUser.email, subject, message);

    const accessToken = jwt.sign(
      { username: newUser.username, userId: newUser._id },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { username: newUser.username, userId: newUser._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "3d" }
    );

    newUser.refreshToken = refreshToken;
    await newUser.save();

    return { accessToken, refreshToken, code };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

userSchema.statics.changePassword = async function (userId, passwordData) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User does not exist!");
    }
    const passwordMatch = await bcrypt.compare(
      passwordData.password,
      user.password
    );
    if (!passwordMatch) {
      throw new Error("Invalid password!");
    }
    const hashPassword = await bcrypt.hash(passwordData.newPassword, 10);
    user.password = hashPassword;
    await user.save();
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

userSchema.statics.verifyMailAddress = async function (verifyData) {
  try {
    const user = await User.findById(verifyData.userId);

    if (user.isEmailVerified) {
      throw new Error("Email already verified");
    }

    if (verifyData.serverCode !== verifyData.userCode) {
      throw new Error("Invalid verification code");
    }

    user.isEmailVerified = true;

    await user.save();
    return user;
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
