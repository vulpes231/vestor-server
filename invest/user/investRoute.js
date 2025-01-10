const { Router } = require("express");
const { buyBot } = require("./investHandler");

const router = Router();
router.route("/").post(buyBot);

module.exports = router;
