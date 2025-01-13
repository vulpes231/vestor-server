const { Router } = require("express");
const { fetchWallets, getBalance } = require("./userWalletHandler");

const router = Router();
router.route("/").get(fetchWallets);
router.route("/balance").get(getBalance);

module.exports = router;
