const { Router } = require("express");
const { getAllTrades, createTrade } = require("./manageTrade");

const router = Router();

router.route("/").get(getAllTrades).post(createTrade);

module.exports = router;
