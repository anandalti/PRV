
    const RestrictedLiftLookup = require('../models/RestrictedLiftLookup');
    const getAllRestrictedLiftLookup = async (req, res) => {
    const data = await RestrictedLiftLookup.getAllRestrictedLiftLookup();
    res.json(data);
    };
    const getRestrictedLiftLookup = async (req, res) => {
    const data = await RestrictedLiftLookup.getRestrictedLiftLookupById(req.params.id);
    res.json(data);
    };
    const createRestrictedLiftLookup = async (req, res) => {
    const data = new RestrictedLiftLookup(req.body);
    const newRestrictedLiftLookup = await RestrictedLiftLookup.createRestrictedLiftLookup(data);
    res.json(newRestrictedLiftLookup);
    };
    const updateRestrictedLiftLookup = async (req, res) => {
    const data = new RestrictedLiftLookup(req.body);
    const updatedRestrictedLiftLookup = await RestrictedLiftLookup.updateRestrictedLiftLookup(req.params.id, data);
    res.json(updatedRestrictedLiftLookup);
    };
    const deleteRestrictedLiftLookup = async (req, res) => {
    const deletedRestrictedLiftLookup = await RestrictedLiftLookup.deleteRestrictedLiftLookup(req.params.id);
    res.json(deletedRestrictedLiftLookup);
    };
    module.exports = {
    getAllRestrictedLiftLookup,
    getRestrictedLiftLookup,
    createRestrictedLiftLookup,
    updateRestrictedLiftLookup,
    deleteRestrictedLiftLookup
    };
    