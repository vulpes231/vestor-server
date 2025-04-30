const express = require("express");
const { resetPassword } = require("./resetPassHandler");

const router = express.Router();

router.post("/", resetPassword);

module.exports = router;
