

const fs = require('fs');
const path = require('path');
const UOM = require("../models/UOM");
const { refreshUomFile } = require('../utils/refreshUomFile');

let _uomsCache = null;
let _defaultUomsCache = null;

const getUOMs = async () => {
    if (_uomsCache) return [..._uomsCache];
    // return await UOM?.getAllUOM();
    // const uomFilePath = path.join(__dirname, '../data/uomData.json');
    const uomFilePath = path.join(__dirname, `../data/workflowSectionFields/UOMs.json`);
    if (fs.existsSync(uomFilePath)) {
        // Read from file
        const fileData = fs.readFileSync(uomFilePath, 'utf8');
        _uomsCache = JSON.parse(fileData);
        return [..._uomsCache];
    } else {
        // Use refreshUomFile to fetch, group, and write
        const result = await refreshUomFile();
        _uomsCache = result;
        return [..._uomsCache];
    }
};

const getDefaultUOMs = async () => {
    if (_defaultUomsCache) return [..._defaultUomsCache];
    const uomFilePath = path.join(__dirname, `../data/workflowSectionFields/DefaultUOMs.json`);
    if (fs.existsSync(uomFilePath)) {
        // Read from file
        const fileData = fs.readFileSync(uomFilePath, 'utf8');
        _defaultUomsCache = JSON.parse(fileData);
        return [..._defaultUomsCache];
    } else {
        // Use refreshUomFile to fetch, group, and write
        const result = await refreshUomFile();
        _defaultUomsCache = result;
        return [..._defaultUomsCache];
    }
};

const clearUomCaches = () => { _uomsCache = null; _defaultUomsCache = null; };


const fetchUoms = async () => {
    const uoms = await UOM.getAllUOM();
    return uoms;
};

module.exports = {
    getUOMs,
    getDefaultUOMs,
    fetchUoms,
    clearUomCaches,
};