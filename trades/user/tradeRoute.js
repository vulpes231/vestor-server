const { Router } = require("express");
const { userTrades, activeTrades, totalProfit } = require("./tradeHandler");

const router = Router();

router.route("/").get(userTrades);
router.route("/active").get(activeTrades);
router.route("/profit").get(totalProfit);

module.exports = router;
