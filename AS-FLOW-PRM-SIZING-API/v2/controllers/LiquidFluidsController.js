
const LiquidFluids = require('../models/LiquidFluids');
const getAllLiquidFluids = async (req, res) => {
    const data = await LiquidFluids.getAllLiquidFluids();
    res.json(data);
};
const getLiquidFluids = async (req, res) => {
    const data = await LiquidFluids.getLiquidFluidsById(req.params.id);
    res.json(data);
};
const createLiquidFluids = async (req, res) => {
    const data = new LiquidFluids(req.body);
    const newLiquidFluids = await LiquidFluids.createLiquidFluids(data);
    res.json(newLiquidFluids);
};
const updateLiquidFluids = async (req, res) => {
    const data = new LiquidFluids(req.body);
    const updatedLiquidFluids = await LiquidFluids.updateLiquidFluids(req.params.id, data);
    res.json(updatedLiquidFluids);
};
const deleteLiquidFluids = async (req, res) => {
    const deletedLiquidFluids = await LiquidFluids.deleteLiquidFluids(req.params.id);
    res.json(deletedLiquidFluids);
};
module.exports = {
    getAllLiquidFluids,
    getLiquidFluids,
    createLiquidFluids,
    updateLiquidFluids,
    deleteLiquidFluids
};
