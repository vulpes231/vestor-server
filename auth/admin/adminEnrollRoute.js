const { Router } = require("express");
const { enrollAdmin } = require("./adminAuthHandler");

const router = Router();
router.route("/").post(enrollAdmin);
// router.route("/enroll").post(enrollAdmin);

module.exports = router;
