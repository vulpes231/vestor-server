const mongoose = require("mongoose");
require("dotenv").config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI);
    console.log("Connected successfully");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Connection failed:", error.message);
  }
};

testConnection();
