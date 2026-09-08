
    const express = require('express');
    const TagDetailsController = require('../controllers/TagDetailsController');
    const router = express.Router();
    router.get('/', TagDetailsController.getAllTagDetails);
    router.get('/:id', TagDetailsController.getTagDetails);
    router.post('/', TagDetailsController.createTagDetails);
    router.put('/:id', TagDetailsController.updateTagDetails);
    router.delete('/:id', TagDetailsController.deleteTagDetails);
    module.exports = router;
    