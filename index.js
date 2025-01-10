const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { reqLogger, errorLogger } = require("./middlewares/logger");
const { corsOptions } = require("./configs/corsOptions");
const { default: mongoose } = require("mongoose");
const { connectDB } = require("./configs/connectDB");
const { verifyJWT } = require("./middlewares/verifyJWT");
require("dotenv").config();
const PORT = process.env.PORT || 4500;

connectDB();

app.use(reqLogger);

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use("/", require("./routes/root"));
app.use("/auth", require("./auth/user/userLoginRoute"));
app.use("/signup", require("./enroll/user/enrollUserRoute"));

app.use(verifyJWT);
// user auth routes
app.use("/user", require("./profiles/user/userProfileRoute"));
app.use("/wallet", require("./wallets/user/userWalletRoute"));
app.use("/trnx", require("./transactions/user/trnxRoute"));

//admin auth routes
app.use("/managetrnx", require("./transactions/admin/manageTrnxRoute"));
app.use("/managepool", require("./invest/admin/managePoolRoute"));

app.use(errorLogger);

mongoose.connection.once("connected", () => {
  app.listen(PORT, () =>
    console.log(`Server started on http://localhost:${PORT}`)
  );
});
