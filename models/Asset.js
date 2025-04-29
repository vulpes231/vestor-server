const { default: axios } = require("axios");
const { default: mongoose } = require("mongoose");
// const axiosRateLimit = require("axios-rate-limit");
require("dotenv").config();

const API_KEY = process.env.COINGECKO_API_KEY;

const Schema = mongoose.Schema;

const assetSchema = new Schema({
  name: {
    type: String,
  },
  symbol: {
    type: String,
  },
  img: {
    type: String,
  },
  price: {
    type: Number,
  },
  marketCap: {
    type: Number,
  },
  dailyChange: {
    type: Number,
  },
  dailyPercentChange: {
    type: Number,
  },
  dailyHigh: {
    type: Number,
  },
  dailyLow: {
    type: Number,
  },
  totalVolume: {
    type: Number,
  },
});

const axiosRateLimit = require("axios-rate-limit");

const http = axiosRateLimit(axios.create(), {
  maxRequests: 10,
  perMilliseconds: 1000,
});

assetSchema.statics.fetchAndSaveAssets = async function () {
  try {
    const url = "https://api.coingecko.com/api/v3/coins/markets";
    const response = await http.get(url, {
      headers: {
        Accept: "application/json",
        "x-cg-demo-api-key": API_KEY,
      },
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 100,
        page: 1,
        sparkline: false,
      },
    });

    const assets = response.data;

    const bulkOps = assets.map((asset) => ({
      updateOne: {
        filter: { symbol: asset.symbol },
        update: {
          $set: {
            name: asset.name,
            symbol: asset.symbol,
            img: asset.image,
            price: asset.current_price,
            marketCap: asset.market_cap,
            dailyChange: asset.price_change_24h,
            dailyPercentChange: asset.price_change_percentage_24h,
            dailyHigh: asset.high_24h,
            dailyLow: asset.low_24h,
            totalVolume: asset.total_volume,
          },
        },
        upsert: true,
      },
    }));

    await this.bulkWrite(bulkOps);

    console.log("Assets fetched and saved with bulkWrite successfully.");
  } catch (error) {
    console.error("Error fetching/saving assets:", error.message);
    throw error;
  }
};

assetSchema.statics.getAllAssets = async function () {
  try {
    const assets = await Asset.find();
    return assets;
  } catch (error) {
    console.log("Error getting assets", error.message);
    throw error;
  }
};

assetSchema.statics.getAssetByParam = async function ({
  assetSymbol,
  assetId,
}) {
  try {
    let asset;

    if (assetSymbol) {
      asset = await Asset.findOne({ symbol: assetSymbol });
      if (!asset) {
        throw new Error("Asset not found by symbol!");
      }
    } else if (assetId) {
      asset = await Asset.findById(assetId);
      if (!asset) {
        throw new Error("Asset not found by ID!");
      }
    } else {
      throw new Error("Either assetSymbol or assetId must be provided!");
    }

    return asset;
  } catch (error) {
    console.log("Error getting asset", error.message);
    throw error;
  }
};

const Asset = mongoose.model("Asset", assetSchema);
module.exports = Asset;
