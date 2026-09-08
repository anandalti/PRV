const express = require('express');
const GenericData = require('../controllers/GenericDataController');
const router = express.Router();

// console.log(' >>>>>>>>>>> Generic Data Routes >>>>>>>>>>>>');
router.get('/fluids', GenericData.getFluids);
router.get('/fluids/:fluidtypeId', GenericData.getFluidById);
router.get('/errorsgrid', GenericData.getGenericErrors);

module.exports = router;