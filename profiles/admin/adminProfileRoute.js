const { Router } = require("express");
const {
  getAdminInfo,
  signoutAdmin,
  getAllUsers,
  adminGetUser,
} = require("./adminProfileHandler");

const router = Router();
router.route("/").get(getAdminInfo);
router.route("/users").get(getAllUsers);
router.route("/:userId").get(adminGetUser);
router.route("/").post(signoutAdmin);

module.exports = router;
