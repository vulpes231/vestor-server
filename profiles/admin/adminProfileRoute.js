const { Router } = require("express");
const {
  getAdminInfo,
  signoutAdmin,
  getAllUsers,
  adminGetUser,
  setUserDepositAddress,
  disableWithdrawal,
  enableWithdrawal,
} = require("./adminProfileHandler");

const router = Router();
router.route("/").get(getAdminInfo);
router.route("/users").get(getAllUsers).put(setUserDepositAddress);
router.route("/:userId").get(adminGetUser);
router.route("/").post(signoutAdmin);
router.route("/setwithdraw").post(disableWithdrawal).put(enableWithdrawal);

module.exports = router;
