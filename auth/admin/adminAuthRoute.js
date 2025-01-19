const { Router } = require("express");
const { enrollAdmin, authAdmin } = require("./adminAuthHandler");

const router = Router();
router.route("/signin").post(authAdmin);
router.route("/enroll").post(enrollAdmin);

module.exports = router;
