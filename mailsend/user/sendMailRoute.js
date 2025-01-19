const { Router } = require("express");
const { sendLoginCode } = require("./sendMailHandler");
const router = Router();

router.route("/").post(sendLoginCode);

module.exports = router;
