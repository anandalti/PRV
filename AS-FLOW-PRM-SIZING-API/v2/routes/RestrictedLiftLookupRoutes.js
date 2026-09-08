
    const express = require('express');
    const RestrictedLiftLookupController = require('../controllers/RestrictedLiftLookupController');
    const router = express.Router();
    router.get('/', RestrictedLiftLookupController.getAllRestrictedLiftLookup);
    router.get('/:id', RestrictedLiftLookupController.getRestrictedLiftLookup);
    router.post('/', RestrictedLiftLookupController.createRestrictedLiftLookup);
    router.put('/:id', RestrictedLiftLookupController.updateRestrictedLiftLookup);
    router.delete('/:id', RestrictedLiftLookupController.deleteRestrictedLiftLookup);
    module.exports = router;
    