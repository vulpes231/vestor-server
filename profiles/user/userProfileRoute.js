const { Router } = require("express");
const { fetchUser, updateUser } = require("./userProfileHandler");

const router = Router();
router.route("/").get(fetchUser).put(updateUser);

module.exports = router;
