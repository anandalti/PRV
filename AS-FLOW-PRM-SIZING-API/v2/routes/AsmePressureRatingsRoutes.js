
    const express = require('express');
    const AsmePressureRatingsController = require('../controllers/AsmePressureRatingsController');
    const router = express.Router();
    router.get('/', AsmePressureRatingsController.getAllAsmePressureRatings);
    router.get('/:id', AsmePressureRatingsController.getAsmePressureRatings);
    router.post('/', AsmePressureRatingsController.createAsmePressureRatings);
    router.put('/:id', AsmePressureRatingsController.updateAsmePressureRatings);
    router.delete('/:id', AsmePressureRatingsController.deleteAsmePressureRatings);
    module.exports = router;
    