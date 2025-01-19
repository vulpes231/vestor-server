const { Schema, default: mongoose } = require("mongoose");
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

adminSchema.statics.createAdmin = async function (adminData) {
  try {
    const admin = await Admin.findOne({ username: adminData.username });

    if (admin) {
      throw new Error("Username taken");
    }
    const hashedPass = await bcrypt.hash(adminData.password, 10);

    const newAdmin = {
      username: adminData.username,
      password: hashedPass,
    };
    await Admin.create(newAdmin);

    return newAdmin;
  } catch (error) {
    throw error;
  }
};

adminSchema.statics.loginAdmin = async function (loginData) {
  try {
    const admin = await Admin.findOne({ username: loginData.username });
    if (!admin) {
      throw new Error("Admin not found!");
    }

    const passwordMatch = await bcrypt.compare(
      loginData.password,
      admin.password
    );
    if (!passwordMatch) {
      throw new Error("Invalid username or password!");
    }

    const accessToken = jwt.sign(
      { admin: admin.username, adminId: admin._id, isAdmin: admin.isAdmin },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "1d" }
    );
    const refreshToken = jwt.sign(
      { admin: admin.username, adminId: admin._id, isAdmin: admin.isAdmin },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
    // Save refresh token to database
    admin.refreshToken = refreshToken;
    await admin.save();
    return { accessToken, refreshToken };
  } catch (error) {
    throw error;
  }
};

adminSchema.statics.getAdmin = async function (adminId) {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error("Admin not found!");
    }
    return admin;
  } catch (error) {
    throw error;
  }
};
adminSchema.statics.logoutAdmin = async function (adminId) {
  try {
    const admin = await Admin.findById(adminId);
    if (!admin) {
      throw new Error("Admin does not exist!");
    }

    admin.refreshToken = null;
    await admin.save();
    return true;
  } catch (error) {
    console.error(error);
    throw new Error("An error occurred while logging out.");
  }
};

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
