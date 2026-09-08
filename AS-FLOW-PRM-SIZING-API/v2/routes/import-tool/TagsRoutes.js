const express = require('express');
const router = express.Router();
const TagsController = require('../../controllers/import-tool/TagsController');

router.get('/list', TagsController.listTags);

router.get('/:id', (req, res) => {
    res.send('Tag Details');
});

router.patch('/tagNumbers', TagsController.updateTagNumbers);

module.exports = router;