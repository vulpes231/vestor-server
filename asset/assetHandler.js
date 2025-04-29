const Asset = require("../models/Asset");

const getAvailableAssets = async (req, res) => {
  try {
    const assets = await Asset.getAllAssets();
    res.status(200).json({ message: "Assets fetched successfully.", assets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAsset = async (req, res) => {
  const { assetSymbol, assetId } = req.params;
  console.log(req.params);
  try {
    const asset = await Asset.getAssetByParam({ assetId, assetSymbol });
    res.status(200).json({ message: "Asset fetched successfully.", asset });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAsset, getAvailableAssets };
