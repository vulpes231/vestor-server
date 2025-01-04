const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { reqLogger, errorLogger } = require("./middlewares/logger");
const { corsOptions } = require("./configs/corsOptions");
const { default: mongoose } = require("mongoose");
const { connectDB } = require("./configs/connectDB");
require("dotenv").config();
const PORT = process.env.PORT || 4500;

// connectDB()

app.use(reqLogger);

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use(errorLogger);

mongoose.connection.once("connected", () => {
  app.listen(PORT, () =>
    console.log(`Server started on http://localhost:${PORT}`)
  );
});
