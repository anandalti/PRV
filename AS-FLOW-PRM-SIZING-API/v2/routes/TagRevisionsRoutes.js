
    const express = require('express');
    const TagRevisionsController = require('../controllers/TagRevisionsController');
    const router = express.Router();
    router.get('/', TagRevisionsController.getAllTagRevisions);
    router.get('/:id', TagRevisionsController.getTagRevisions);
    router.post('/', TagRevisionsController.createTagRevisions);
    router.post('/update', TagRevisionsController.updateAll);
    router.put('/:id', TagRevisionsController.updateTagRevisions);
    router.delete('/:id', TagRevisionsController.deleteTagRevisions);
    module.exports = router;
    