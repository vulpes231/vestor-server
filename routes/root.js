const { Router } = require("express");

const router = Router();

router.route("/", async (req, res) => {
  res.json({ message: "Welcome to the vestor!" });
});

module.exports = router;
