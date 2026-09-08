
    const MappingSAPModelSpecialRequirements = require('../models/MappingSAPModelSpecialRequirements');
    const getAllMappingSAPModelSpecialRequirements = async (req, res) => {
    const data = await MappingSAPModelSpecialRequirements.getAllMappingSAPModelSpecialRequirements();
    res.json(data);
    };
    const getMappingSAPModelSpecialRequirements = async (req, res) => {
    const data = await MappingSAPModelSpecialRequirements.getMappingSAPModelSpecialRequirementsById(req.params.id);
    res.json(data);
    };
    const createMappingSAPModelSpecialRequirements = async (req, res) => {
    const data = new MappingSAPModelSpecialRequirements(req.body);
    const newMappingSAPModelSpecialRequirements = await MappingSAPModelSpecialRequirements.createMappingSAPModelSpecialRequirements(data);
    res.json(newMappingSAPModelSpecialRequirements);
    };
    const updateMappingSAPModelSpecialRequirements = async (req, res) => {
    const data = new MappingSAPModelSpecialRequirements(req.body);
    const updatedMappingSAPModelSpecialRequirements = await MappingSAPModelSpecialRequirements.updateMappingSAPModelSpecialRequirements(req.params.id, data);
    res.json(updatedMappingSAPModelSpecialRequirements);
    };
    const deleteMappingSAPModelSpecialRequirements = async (req, res) => {
    const deletedMappingSAPModelSpecialRequirements = await MappingSAPModelSpecialRequirements.deleteMappingSAPModelSpecialRequirements(req.params.id);
    res.json(deletedMappingSAPModelSpecialRequirements);
    };
    module.exports = {
    getAllMappingSAPModelSpecialRequirements,
    getMappingSAPModelSpecialRequirements,
    createMappingSAPModelSpecialRequirements,
    updateMappingSAPModelSpecialRequirements,
    deleteMappingSAPModelSpecialRequirements
    };
    