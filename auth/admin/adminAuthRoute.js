const { Router } = require("express");
const { enrollAdmin, authAdmin } = require("./adminAuthHandler");

const router = Router();
router.route("/").post(authAdmin);
// router.route("/enroll").post(enrollAdmin);

module.exports = router;
