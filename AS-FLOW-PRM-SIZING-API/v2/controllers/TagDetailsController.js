
    const TagDetails = require('../models/TagDetails');
    const getAllTagDetails = async (req, res) => {
    const data = await TagDetails.getAllTagDetails();
    res.json(data);
    };
    const getTagDetails = async (req, res) => {
    const data = await TagDetails.getTagDetailsById(req.params.id);
    res.json(data);
    };
    const createTagDetails = async (req, res) => {
    const data = new TagDetails(req.body);
    const newTagDetails = await TagDetails.createTagDetails(data);
    res.json(newTagDetails);
    };
    const updateTagDetails = async (req, res) => {
    const data = new TagDetails(req.body);
    const updatedTagDetails = await TagDetails.updateTagDetails(req.params.id, data);
    res.json(updatedTagDetails);
    };
    const deleteTagDetails = async (req, res) => {
    const deletedTagDetails = await TagDetails.deleteTagDetails(req.params.id);
    res.json(deletedTagDetails);
    };
    module.exports = {
    getAllTagDetails,
    getTagDetails,
    createTagDetails,
    updateTagDetails,
    deleteTagDetails
    };
    