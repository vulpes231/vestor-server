const { Router } = require("express");
const { createTrnx, getTransactions, approveTrnx } = require("./manageTrnx");

const router = Router();
router.route("/").post(createTrnx).get(getTransactions);
router.route("/:transactionId").post(approveTrnx);

module.exports = router;
