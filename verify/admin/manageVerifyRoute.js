const { Router } = require("express");
const {
  approveVerification,
  getAllVerifyRequest,
  rejectVerification,
  getUserVerifyRequest,
} = require("./manageVerify");

const router = Router();

router
  .route("/")
  .get(getAllVerifyRequest)
  .post(approveVerification)
  .put(rejectVerification);

router.route("/:userId").get(getUserVerifyRequest);

module.exports = router;
