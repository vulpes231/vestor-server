const express = require("express");
const { resetPassword, verifyAndReset } = require("./resetPassHandler");

const router = express.Router();

router.route("/").post(resetPassword).put(verifyAndReset);

module.exports = router;
