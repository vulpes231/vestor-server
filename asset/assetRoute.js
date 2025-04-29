const { Router } = require("express");
const { getAvailableAssets, getAsset } = require("./assetHandler");

const router = Router();
router.route("/all").get(getAvailableAssets);
router.route("/:assetSymbol?/:assetId?").get(getAsset);


module.exports = router;
