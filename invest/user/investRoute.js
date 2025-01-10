const { Router } = require("express");
const { buyBot, getUserBots, getPlans } = require("./investHandler");

const router = Router();
router.route("/").post(buyBot).get(getUserBots);
router.route("/plans").get(getPlans);

module.exports = router;
