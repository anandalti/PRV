
    const express = require('express');
    const UserReportHeaderController = require('../controllers/UserReportHeaderController');
    const router = express.Router();
    router.get('/', UserReportHeaderController.getAllUserReportHeader);
    router.get('/:id', UserReportHeaderController.getUserReportHeader);
    router.post('/', UserReportHeaderController.createUserReportHeader);
    router.put('/:id', UserReportHeaderController.updateUserReportHeader);
    router.delete('/:id', UserReportHeaderController.deleteUserReportHeader);
    module.exports = router;
    