
    const Brands = require('../models/Brands');
    const getAllBrands = async (req, res) => {
    const data = await Brands.getAllBrands();
    res.json(data);
    };
    const getBrands = async (req, res) => {
    const data = await Brands.getBrandsById(req.params.id);
    res.json(data);
    };
    const createBrands = async (req, res) => {
    const data = new Brands(req.body);
    const newBrands = await Brands.createBrands(data);
    res.json(newBrands);
    };
    const updateBrands = async (req, res) => {
    const data = new Brands(req.body);
    const updatedBrands = await Brands.updateBrands(req.params.id, data);
    res.json(updatedBrands);
    };
    const deleteBrands = async (req, res) => {
    const deletedBrands = await Brands.deleteBrands(req.params.id);
    res.json(deletedBrands);
    };
    module.exports = {
    getAllBrands,
    getBrands,
    createBrands,
    updateBrands,
    deleteBrands
    };
    