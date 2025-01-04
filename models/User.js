const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
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
      required: true,
      unique: true,
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
    fullname: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    pin: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    refreshToken: {
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
      username: loginData.username,
    });

    if (!user) {
      throw new Error("User does not exist!");
    }
    const passwordMatch = await bcrypt.compare(
      loginData.password,
      user.password
    );
    if (!passwordMatch) {
      throw new Error("Invalid username OR password!");
    }
    const accessToken = jwt.sign(
      { username: user.username, userId: user._id },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "1day" }
    );
    const refreshToken = jwt.sign(
      { username: user.username, userId: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "1day" }
    );
    user.refreshToken = refreshToken;
    await user.save();
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// logout user
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
    console.log(error);
    throw error;
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
    console.log(error);
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
    if (userData.fullname) {
      user.fullname = userData.fullname;
    }
    if (userData.email) {
      user.email = userData.email;
    }
    await user.save();
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// register user
userSchema.statics.registerUser = async function (userData) {
  console.log("userData", userData);
  try {
    const user = await User.findOne({
      username: userData.username,
    });
    if (user) {
      throw new Error("Username taken!");
    }

    const hashPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await User.create({
      username: userData.username,
      password: hashPassword,
      email: userData.email,
      fullname: userData.fullname,
      pin: userData.pin,
    });

    const depositWallet = await Wallet.create({
      ownerId: newUser._id,
      walletName: "Deposit",
    });

    const investWallet = await Wallet.create({
      ownerId: newUser._id,
      walletName: "Invest",
    });

    return newUser;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const User = mongoose.model("User", userSchema);

module.exports = User;
