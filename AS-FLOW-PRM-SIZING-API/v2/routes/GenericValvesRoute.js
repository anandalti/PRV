const express = require("express");
const GenericValesController = require("../controllers/GenericValvesController");
const router = express.Router();

router.post("/", GenericValesController.getAllGenericValves);
module.exports = router;
