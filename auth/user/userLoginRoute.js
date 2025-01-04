const { Router } = require("express");
const { loginUser } = require("./userLoginHandler");

const router = Router();
router.route("/").post(loginUser);

module.exports = router;
