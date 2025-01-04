const { Router } = require("express");
const { fetchUser, updateUser, logoutClient } = require("./userProfileHandler");

const router = Router();
router.route("/").get(fetchUser).put(updateUser);
router.route("/logout").post(logoutClient);

module.exports = router;
