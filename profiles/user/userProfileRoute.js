const { Router } = require("express");
const {
  fetchUser,
  updateUser,
  logoutClient,
  updatePassword,
  updateEmail,
  verifyEmail,
} = require("./userProfileHandler");

const router = Router();
router.route("/").get(fetchUser).put(updateUser);
router.route("/logout").post(logoutClient);
router.route("/changepass").post(updatePassword);
router.route("/changemail").post(updateEmail);
router.route("/verifymail").post(verifyEmail);

module.exports = router;
