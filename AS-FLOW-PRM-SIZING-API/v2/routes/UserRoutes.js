
    const express = require('express');
    const UserController = require('../controllers/UserController');
    const router = express.Router();
    router.get('/', UserController.getAllUser);
    router.get('/:id', UserController.getUser);
    router.post('/', UserController.createUser);
    router.put('/:id', UserController.updateUser);
    router.delete('/:id', UserController.deleteUser);
    module.exports = router;
    