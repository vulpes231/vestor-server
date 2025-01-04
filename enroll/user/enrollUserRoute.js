const { Router } = require("express");
const { enrollUser } = require("./enrollUserHandler");

const router = Router();
router.route("/").post(enrollUser);

module.exports = router;
