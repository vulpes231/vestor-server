const { Router } = require("express");
const {
  buyBot,
  getUserBots,
  getPlans,
  newPlan,
  updatePlan,
} = require("./investHandler");

const router = Router();
router.route("/").post(buyBot).get(getUserBots);
router.route("/plan").get(getPlans).post(newPlan).put(updatePlan);

module.exports = router;
