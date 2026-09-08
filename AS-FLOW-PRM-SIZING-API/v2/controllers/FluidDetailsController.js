
    const FluidDetails = require('../models/FluidDetails');
    const getAllFluidDetails = async (req, res) => {
    const data = await FluidDetails.getAllFluidDetails();
    res.json(data);
    };
    const getFluidDetails = async (req, res) => {
    const data = await FluidDetails.getFluidDetailsById(req.params.id);
    res.json(data);
    };
    const createFluidDetails = async (req, res) => {
    const data = new FluidDetails(req.body);
    const newFluidDetails = await FluidDetails.createFluidDetails(data);
    res.json(newFluidDetails);
    };
    const updateFluidDetails = async (req, res) => {
    const data = new FluidDetails(req.body);
    const updatedFluidDetails = await FluidDetails.updateFluidDetails(req.params.id, data);
    res.json(updatedFluidDetails);
    };
    const deleteFluidDetails = async (req, res) => {
    const deletedFluidDetails = await FluidDetails.deleteFluidDetails(req.params.id);
    res.json(deletedFluidDetails);
    };
    module.exports = {
    getAllFluidDetails,
    getFluidDetails,
    createFluidDetails,
    updateFluidDetails,
    deleteFluidDetails
    };
    