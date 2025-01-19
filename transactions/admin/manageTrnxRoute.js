const { Router } = require("express");
const {
  createTrnx,
  getTransactions,
  approveTrnx,
  rejectTrnx,
} = require("./manageTrnx");

const router = Router();
router.route("/").post(createTrnx).get(getTransactions);
router.route("/:transactionId").post(approveTrnx).put(rejectTrnx);

module.exports = router;
