const { Schema, default: mongoose } = require("mongoose");
const User = require("./User");
const { sendMail } = require("../utils/mailer");

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

    const subject = "Verification request";
    const message = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification request | Vestor </title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
          }
          .header {
              border-bottom: 1px solid #eaeaea;
              padding-bottom: 20px;
              margin-bottom: 20px;
              text-align: center;
          }
          .logo {
              color: #2d3748;
              font-size: 24px;
              font-weight: bold;
              text-decoration: none;
          }
          .content {
              padding: 0 0 20px 0;
          }
          .footer {
              border-top: 1px solid #eaeaea;
              padding-top: 20px;
              font-size: 12px;
              color: #777777;
              text-align: center;
          }
          .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4f46e5;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
          }
          .highlight-box {
              background-color: #f8fafc;
              border-left: 4px solid #4f46e5;
              padding: 16px;
              margin: 20px 0;
              border-radius: 0 4px 4px 0;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <a href="#" class="logo">Vestor</a>
      </div>
      
      <div class="content">
          <h2 style="color: #2d3748; margin-top: 0;">Hi admin,</h2>
          
          <p>Your verification request has been received and is currently being processed.</p>
          
          <div class="highlight-box">
              <p style="margin: 0; font-size: 18px; font-weight: bold;">Our team will get back to you shortly.</p>
          </div>
          
      </div>
      
      <div class="footer">
          <p>© 2025 Vestor Markets. All rights reserved.</p>
          <p>
              <a href="#" style="color: #4f46e5; text-decoration: none;">Privacy Policy</a> | 
              <a href="#" style="color: #4f46e5; text-decoration: none;">Terms of Service</a> |
              <a href="#" style="color: #4f46e5; text-decoration: none;">Contact Support</a>
          </p>
          <p>Vestor Financial Services New York, NY</p>
      </div>
  </body>
  </html>
  `;

    await sendMail(user.email, subject, message);

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

    const subject = "Verification successful";
    const message = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification successful | Vestor </title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
          }
          .header {
              border-bottom: 1px solid #eaeaea;
              padding-bottom: 20px;
              margin-bottom: 20px;
              text-align: center;
          }
          .logo {
              color: #2d3748;
              font-size: 24px;
              font-weight: bold;
              text-decoration: none;
          }
          .content {
              padding: 0 0 20px 0;
          }
          .footer {
              border-top: 1px solid #eaeaea;
              padding-top: 20px;
              font-size: 12px;
              color: #777777;
              text-align: center;
          }
          .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4f46e5;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
          }
          .highlight-box {
              background-color: #f8fafc;
              border-left: 4px solid #4f46e5;
              padding: 16px;
              margin: 20px 0;
              border-radius: 0 4px 4px 0;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <a href="#" class="logo">Vestor</a>
      </div>
      
      <div class="content">
          <h2 style="color: #2d3748; margin-top: 0;">Hi admin,</h2>
          
          <p>Your verification request is successful, Your account is now fully verified.</p>
          
          <div class="highlight-box">
              <p style="margin: 0; font-size: 18px; font-weight: bold;">Enjoy the full features of the app.</p>
          </div>
          
      </div>
      
      <div class="footer">
          <p>© 2025 Vestor Markets. All rights reserved.</p>
          <p>
              <a href="#" style="color: #4f46e5; text-decoration: none;">Privacy Policy</a> | 
              <a href="#" style="color: #4f46e5; text-decoration: none;">Terms of Service</a> |
              <a href="#" style="color: #4f46e5; text-decoration: none;">Contact Support</a>
          </p>
          <p>Vestor Financial Services New York, NY</p>
      </div>
  </body>
  </html>
  `;

    await sendMail(user.email, subject, message);

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
    const subject = "Verification successful";
    const message = `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verification successful | Vestor </title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
          }
          .header {
              border-bottom: 1px solid #eaeaea;
              padding-bottom: 20px;
              margin-bottom: 20px;
              text-align: center;
          }
          .logo {
              color: #2d3748;
              font-size: 24px;
              font-weight: bold;
              text-decoration: none;
          }
          .content {
              padding: 0 0 20px 0;
          }
          .footer {
              border-top: 1px solid #eaeaea;
              padding-top: 20px;
              font-size: 12px;
              color: #777777;
              text-align: center;
          }
          .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4f46e5;
              color: #ffffff !important;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
          }
          .highlight-box {
              background-color: #f8fafc;
              border-left: 4px solid #4f46e5;
              padding: 16px;
              margin: 20px 0;
              border-radius: 0 4px 4px 0;
          }
      </style>
  </head>
  <body>
      <div class="header">
          <a href="#" class="logo">Vestor</a>
      </div>
      
      <div class="content">
          <h2 style="color: #2d3748; margin-top: 0;">Hi admin,</h2>
          
          <p>Your verification request is rejected, Try uploading a clear front and back image of your documents again.</p>
          
          <div class="highlight-box">
              <p style="margin: 0; font-size: 18px; font-weight: bold;">Contact admin if you have any issues uploading your documents.</p>
          </div>
          
      </div>
      
      <div class="footer">
          <p>© 2025 Vestor Markets. All rights reserved.</p>
          <p>
              <a href="#" style="color: #4f46e5; text-decoration: none;">Privacy Policy</a> | 
              <a href="#" style="color: #4f46e5; text-decoration: none;">Terms of Service</a> |
              <a href="#" style="color: #4f46e5; text-decoration: none;">Contact Support</a>
          </p>
          <p>Vestor Financial Services New York, NY</p>
      </div>
  </body>
  </html>
  `;

    await sendMail(user.email, subject, message);
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
