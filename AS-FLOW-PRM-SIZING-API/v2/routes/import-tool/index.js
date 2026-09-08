const express = require('express');
const router = express.Router();
const jwtAuthMiddleware = require('../../middlewares/import-tool/jwtAuthMiddleware');
const { testSSE } = require('../../controllers/import-tool/SSEController');

router.get('/', (req, res) => {
    res.send('Import Tool API');
});

router.get('/test-sse', testSSE);

const authRouter = require('./AuthRoutes');
router.use('/auth', authRouter);

const tokenRouter = require('./TokenRoutes');
router.use('/token', tokenRouter);

const sseRouter = require('./SSERoutes');
router.use('/job-status', jwtAuthMiddleware, sseRouter);

const tagsRouter = require('./TagsRoutes');
router.use('/tags', jwtAuthMiddleware, tagsRouter);

const exportRouter = require('./ExportRoutes');
router.use('/export', exportRouter);

const configitBomSolveRouter = require('./ConfigitBomSolveRoutes');
router.use('/bom-solve', jwtAuthMiddleware, configitBomSolveRouter);

const excelRouter = require('./ExcelRoutes');
router.use('/excel', jwtAuthMiddleware, excelRouter);

const oracleOrderStatusRouter = require('./OracleOrderStatusRoutes');
router.use('/oracle-order-status', jwtAuthMiddleware, oracleOrderStatusRouter);
const payloadRouter = require('./OracleAPIRoutes');
router.use('/payload', payloadRouter);

module.exports = router;