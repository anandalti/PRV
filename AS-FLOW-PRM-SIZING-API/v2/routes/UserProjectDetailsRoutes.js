
    const express = require('express');
    const UserProjectDetailsController = require('../controllers/UserProjectDetailsController');
    const router = express.Router();
    router.get('/', UserProjectDetailsController.getAllUserProjectDetails);
    router.get('/:id', UserProjectDetailsController.getUserProjectDetails);
    router.post('/', UserProjectDetailsController.createUserProjectDetails);
    router.put('/:id', UserProjectDetailsController.updateUserProjectDetails);
    router.delete('/:id', UserProjectDetailsController.deleteUserProjectDetails);
    module.exports = router;
    