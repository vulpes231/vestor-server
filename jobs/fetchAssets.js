const cron = require("node-cron");
const Asset = require("../models/Asset");

async function startAssetCronJob() {
  try {
    console.log("Starting asset cron job...");

    await Asset.fetchAndSaveAssets();

    // Then schedule it every 4 hours
    cron.schedule("0 */4 * * *", async () => {
      console.log("Running scheduled asset fetch...");
      await Asset.fetchAndSaveAssets();
    });
  } catch (error) {
    console.error("Error starting asset cron job:", error.message);
  }
}

module.exports = { startAssetCronJob };
