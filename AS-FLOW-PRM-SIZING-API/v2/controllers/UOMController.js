
const UOM = require('../models/UOM');
const { FieldUomConversion, displayUnitUOMConversion } = require('../service/fieldCalculations/FieldUomConversion');
const { getUOMs } = require('../service/getUom');
const sizingOperationsUseCases = require('../service/usecases/sizingOperations');
const sizingQueryUseCases = require('../service/usecases/sizingQuery');

const getAllUOM = async (req, res) => {
    const data = await getUOMs();
    const uomData = data.reduce((acc, uom) => {
        // check if uom.DimensionName exists in acc
        if (acc[uom.DimensionName]) {
            acc[uom.DimensionName].push(uom);
        } else {
            acc[uom.DimensionName] = [
                uom
            ];
        }
        return acc;
    }, {});
    res.status(200).json(uomData);
};

const getAllUOMDetails = async (req, res) => {
    try {
        const data = await sizingQueryUseCases.getUomDetails({
            userId: req.query?.userId || req.user?.email,
        });

        res.status(200).json({status:"Success", data});
    } catch (error) {
        const status = error?.status || 500;
        res.status(status).json({status:"Error", message:error.message});
    }
    
};
const getUOM = async (req, res) => {
    const data = await UOM.getUOMById(req.params.id);
    res.json(data);
};
const createUOM = async (req, res) => {
    const data = new UOM(req.body);
    const newUOM = await UOM.createUOM(data);
    res.json(newUOM);
};
const updateUOM = async (req, res) => {
    const data = new UOM(req.body);
    const updatedUOM = await UOM.updateUOM(req.params.id, data);
    res.json(updatedUOM);
};
const deleteUOM = async (req, res) => {
    const deletedUOM = await UOM.deleteUOM(req.params.id);
    res.json(deletedUOM);
};

const convertSameUomValues = async (req, res) => {
    const payload= req.body;

    try {
        const response = await sizingOperationsUseCases.convertUom({ payload });
        // console.log({response,payload})
        return res.status(200).json({status: 'Success', ...response});

    } catch (error) {
        return res.status(error?.status || 400).json({ status: 'Error', error: error.message });
    }
}

const displayUnitConversion = async (req, res) => {
    const payload= req.body;

    try {
        const response=await displayUnitUOMConversion(payload);
        // console.log({response,payload})
        return res.status(200).json({status: 'Success', ...response});

    } catch (error) {
        return res.status(400).json({ status: 'Error', error: error.message });
    }
}




module.exports = {
    getAllUOM,
    getUOM,
    createUOM,
    updateUOM,
    deleteUOM,
    convertSameUomValues,
    getAllUOMDetails,
    displayUnitConversion
};
