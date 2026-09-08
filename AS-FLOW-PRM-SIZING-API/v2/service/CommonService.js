const fs = require('fs');
const path = require('path');

const getFluidsDetails = async () => {
    // return await UOM?.getAllUOM();
    const fluidsFilePath = path.join(__dirname, '../data/fluidTypes.json');
    // if (fs.existsSync(fluidsFilePath)) {
        // Read from file
    const fileData = fs.readFileSync(fluidsFilePath, 'utf8');
    const fluids = JSON.parse(fileData);
    // console.log(' >>>>>>>>>> ',fluids,typeof fluids);
    return {...fluids};
    // } else {
    //     // Use refreshFluidsFile to fetch, group, and write
    //     return await refreshFluidsFile();
    // }
};

const getFluidsDetailById = async (fluidTypeId) => {
    // return await UOM?.getAllUOM();
    const fluidsFilePath = path.join(__dirname, '../data/fluidTypes.json');
    // if (fs.existsSync(fluidsFilePath)) {
        // Read from file
    const fileData = fs.readFileSync(fluidsFilePath, 'utf8');
    const fluids = JSON.parse(fileData);
    // console.log(' >>>>>>>>>> ',fluids,typeof fluids);
    const fluidData = fluids[fluidTypeId];
    return {...fluidData};
    // } else {
    //     // Use refreshFluidsFile to fetch, group, and write
    //     return await refreshFluidsFile();
    // }
};

const getWorkflowFluids = async(fluidTypeId,fluidId) =>{
    const fluidsFilePath = path.join(__dirname, '../data/fluidTypes.json');
    const fileData = fs.readFileSync(fluidsFilePath, 'utf8');
    const fluids = JSON.parse(fileData);
    // console.log(' >>>>>>>>>>>> ',fluidTypeId,fluidId);
    const fluidData=fluids[fluidTypeId]?.item?.find(it=>it?.GasId == fluidId || it?.SteamId == fluidId || it?.LiquidId == fluidId);
    // console.log(fluidData)
    return fluidData;
}

let _genericErrorsCache = null;

const getGenericErrorsDetails = async () => {
    if (_genericErrorsCache) return [..._genericErrorsCache];
    const errorsFilePath = path.join(__dirname, '../data/genericErrors.json');
    // if (fs.existsSync(errorsFilePath)) {
        // Read from file
        const fileData = fs.readFileSync(errorsFilePath, 'utf8');
        _genericErrorsCache = JSON.parse(fileData);
        return [..._genericErrorsCache];
    // } else {
    //     // Use refreshGenericErrorsFile to fetch, group, and write
    //     return await refreshGenericErrorsFile();
    // }
};

const clearGenericErrorsCache = () => { _genericErrorsCache = null; };


module.exports = {
    getFluidsDetails,
    getWorkflowFluids,
    getFluidsDetailById,
    getGenericErrorsDetails,
    clearGenericErrorsCache
};