const { Router } = require("express");
const { createTrnx } = require("./manageTrnx");

const router = Router();
router.route("/").post(createTrnx);

module.exports = router;
