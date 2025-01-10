const { Router } = require("express");
const { createTrnx, getTransactions } = require("./manageTrnx");

const router = Router();
router.route("/").post(createTrnx).get(getTransactions);

module.exports = router;
