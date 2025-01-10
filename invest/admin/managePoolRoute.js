const { Router } = require("express");
const { createPool } = require("./managePools");

const router = Router();
router.route("/").post(createPool);

module.exports = router;
