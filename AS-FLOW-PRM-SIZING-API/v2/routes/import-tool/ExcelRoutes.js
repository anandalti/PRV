const express = require('express');
const router = express.Router();

const { readExcelData } = require('../../controllers/import-tool/ExcelController');

router.post('/', readExcelData);

module.exports = router;