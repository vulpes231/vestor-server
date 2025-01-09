const { Router } = require("express");
const { makeDeposit, makeWithdrawal, makeTransfer } = require("./trnxHandler");

const router = Router();
router.route("/deposit").post(makeDeposit);
router.route("/withdraw").post(makeWithdrawal);
router.route("/transfer").post(makeTransfer);

module.exports = router;
