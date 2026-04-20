const { Router } = require("express");
const { deAuthAdmin } = require("./adminAuthHandler");

const router = Router();
router.route("/").post(deAuthAdmin);

module.exports = router;
