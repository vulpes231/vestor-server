const { Router } = require("express");
const {
  fetchUser,
  updateUser,
  logoutClient,
  updatePassword,
} = require("./userProfileHandler");

const router = Router();
router.route("/").get(fetchUser).put(updateUser);
router.route("/logout").post(logoutClient);
router.route("/changepass").post(updatePassword);

module.exports = router;
