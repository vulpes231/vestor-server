const { Router } = require("express");
const { getAdminInfo, signoutAdmin } = require("./adminProfileHandler");

const router = Router();
router.route("/").get(getAdminInfo);
router.route("/").post(signoutAdmin);

module.exports = router;
