const { Router } = require("express");
const { requestVerification, getVerifyData } = require("./verifyHandler");

const router = Router();

router.route("/").post(requestVerification).get(getVerifyData);

module.exports = router;
