const { Router } = require("express");
const {
  userTrades,
  activeTrades,
  totalProfit,
  buyAsset,
  sellAsset,
} = require("./tradeHandler");

const router = Router();

router.route("/").get(userTrades).post(buyAsset);
router.route("/active").get(activeTrades);
router.route("/profit").get(totalProfit);
router.route("/close").post(sellAsset);

module.exports = router;
