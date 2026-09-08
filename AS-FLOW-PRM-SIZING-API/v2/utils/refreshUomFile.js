// /v2/utils/refreshUomFile.js

const fs = require('fs');
const path = require('path');
const UOM = require('../models/UOM');

// Groups array of UOMs by DimensionName and writes to uomData.json
async function refreshUomFile() {
  const outputPath = path.join(__dirname, '../data/uomData.json');
  const uoms = await UOM.getAllUOM();
  // Group by DimensionName
//   const grouped = {};
//   for (const obj of uoms) {
//     const key = obj.DimensionName;
//     if (!grouped[key]) grouped[key] = [];
//     grouped[key].push(obj);
//   }
  fs.writeFileSync(outputPath, JSON.stringify(uoms, null, 2), 'utf8');
  return uoms;
}

module.exports = { refreshUomFile };
