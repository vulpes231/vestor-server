const { Router } = require("express");
const { fetchWallets } = require("./userWalletHandler");

const router = Router();
router.route("/").get(fetchWallets);

module.exports = router;
