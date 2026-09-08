// /v2/utils/RefreshUom.js

const { refreshUomFile } = require('./refreshUomFile');

async function RefreshUoms() {
  try {
    refreshUomFile();

  } catch (err) {
    console.error('Error refreshing UOM data:', err);
    process.exit(1);
  }
}

module.exports = { RefreshUoms };

// main();