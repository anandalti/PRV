
    const FluidType = require('../models/FluidType');
const { getWorkflowFluids } = require('../service/CommonService');
    const getAllFluidType = async (req, res) => {
    const data = await FluidType.getAllFluidType();
    res.json(data);
    };
    const getFluidType = async (req, res) => {
    const data = await FluidType.getFluidTypeById(req.params.id);
    res.json(data);
    };

    const getFluidDetails = async (req, res) => {
        const fluidTypeId = req.query.fluidTypeId;
        const fluidId = req.query.fluidId;
        console.log(' >>>>>>>>>>>> ',fluidTypeId,fluidId);
        const data = await getWorkflowFluids(fluidTypeId, fluidId);
        // const data = await FluidType.getFluidDetails();
        res.json(data);
    }
    const createFluidType = async (req, res) => {
    const data = new FluidType(req.body);
    const newFluidType = await FluidType.createFluidType(data);
    res.json(newFluidType);
    };
    const updateFluidType = async (req, res) => {
    const data = new FluidType(req.body);
    const updatedFluidType = await FluidType.updateFluidType(req.params.id, data);
    res.json(updatedFluidType);
    };
    const deleteFluidType = async (req, res) => {
    const deletedFluidType = await FluidType.deleteFluidType(req.params.id);
    res.json(deletedFluidType);
    };
    module.exports = {
    getAllFluidType,
    getFluidType,
    createFluidType,
    updateFluidType,
    deleteFluidType,
    getFluidDetails
    };
    