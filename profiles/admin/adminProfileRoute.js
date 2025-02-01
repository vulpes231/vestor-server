const { Router } = require("express");
const {
  getAdminInfo,
  signoutAdmin,
  getAllUsers,
  adminGetUser,
  setUserDepositAddress,
} = require("./adminProfileHandler");

const router = Router();
router.route("/").get(getAdminInfo);
router.route("/users").get(getAllUsers).put(setUserDepositAddress);
router.route("/:userId").get(adminGetUser);
router.route("/").post(signoutAdmin);

module.exports = router;
