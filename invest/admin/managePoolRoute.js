const { Router } = require("express");
const { createPool, getUserBots } = require("./managePools");

const router = Router();
router.route("/").post(createPool);
router.route("/:userId").get(getUserBots);

module.exports = router;
