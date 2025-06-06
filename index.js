const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { reqLogger, errorLogger } = require("./middlewares/logger");
const { corsOptions } = require("./configs/corsOptions");
const { default: mongoose } = require("mongoose");
const { connectDB } = require("./configs/connectDB");
const { verifyJWT } = require("./middlewares/verifyJWT");
const { startAssetCronJob } = require("./jobs/fetchAssets");
const resetPassRouter = require("./resetpass/user/resetPassRoute");
require("dotenv").config();
const PORT = process.env.PORT || 4500;

connectDB();

app.use(reqLogger);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use("/resetlink", resetPassRouter);
app.use("/auth", require("./auth/user/userLoginRoute"));
app.use("/signup", require("./enroll/user/enrollUserRoute"));
app.use("/signin", require("./auth/admin/adminAuthRoute"));
app.use("/enroll", require("./auth/admin/adminEnrollRoute"));
app.use("/", require("./routes/root"));

app.use(verifyJWT);
// user auth routes
app.use("/user", require("./profiles/user/userProfileRoute"));
app.use("/wallet", require("./wallets/user/userWalletRoute"));
app.use("/ticket", require("./ticket/user/ticketRoute"));
app.use("/trnx", require("./transactions/user/trnxRoute"));
app.use("/pool", require("./invest/user/investRoute"));
app.use("/trade", require("./trades/user/tradeRoute"));
app.use("/otp", require("./mailsend/user/sendMailRoute"));
app.use("/assets", require("./asset/assetRoute"));

app.use(
  "/verify",
  upload.single("image"),
  require("./verify/user/verifyRoute")
);

//admin auth routes
app.use("/managetrnx", require("./transactions/admin/manageTrnxRoute"));
app.use("/managepool", require("./invest/admin/managePoolRoute"));
app.use("/managetrade", require("./trades/admin/manageTradeRoute"));
app.use("/manageverify", require("./verify/admin/manageVerifyRoute"));
app.use("/manageadmin", require("./profiles/admin/adminProfileRoute"));
app.use("/manageticket", require("./ticket/admin/adminTicketRoute"));
app.use("/sendmail", require("./mailsend/admin/adminMailRoute"));

app.use(errorLogger);

mongoose.connection.once("connected", () => {
  startAssetCronJob();
  app.listen(PORT, () =>
    console.log(`Server started on http://localhost:${PORT}`)
  );
});

mongoose.connection.on("error", (err) => {
  console.error("Database connection error:", err);
});
