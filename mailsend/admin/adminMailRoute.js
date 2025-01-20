const { Router } = require("express");
const { sendMailToUser } = require("./adminMailHandler");
const router = Router();

router.route("/").post(sendMailToUser);

module.exports = router;
