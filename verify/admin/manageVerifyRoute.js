const { Router } = require("express");
const {
  approveVerification,
  getAllVerifyRequest,
  rejectVerification,
} = require("./manageVerify");

const router = Router();

router
  .route("/")
  .get(getAllVerifyRequest)
  .post(approveVerification)
  .put(rejectVerification);

module.exports = router;
