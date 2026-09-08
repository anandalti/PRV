const express = require('express');
const rateLimit = require('express-rate-limit');
const DrawingController = require('../controllers/DrawingController');
const authMiddleware = require('../middlewares/auth/authMiddleware');
const router = express.Router();

const drawingDownloadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,             // max 30 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'Error', message: 'Too many requests, please try again later.' }
});

router.get('/getLocations', DrawingController.getLocations);
router.get('/getLanguages', DrawingController.getLanguages);
router.post('/getAvailableViews', DrawingController.getAvailableViews);
router.post('/getFormatList', DrawingController.getFormatList);
router.post('/getCADFileURL', DrawingController.getCADFileURL);
// router.get('/downloadFromUrl', DrawingController.downloadFromUrl);
router.post('/getDrawingURL', DrawingController.getDrawingURL);
router.get(`/getConfigData/:configHeaderId`, DrawingController.getConfigData);
router.get(`/getDrawingfile`, authMiddleware,DrawingController.getDrawingfile);
router.get(`/IsDrawingAvailable`,authMiddleware, DrawingController.IsDrawingAvailable);
router.post(`/getDrawingStatus`,authMiddleware, DrawingController.GetDrawingStatus);
router.post(`/generateDrawing`, authMiddleware, DrawingController.generateDrawing);
router.get('/ads/validmodels',authMiddleware, DrawingController.getADSValidModels);

// router.get(`/getDrawingfileAV2`,authMiddleware, DrawingController.getDrawingfile);
// router.get(`/IsDrawingAvailableAV2`,authMiddleware, DrawingController.IsDrawingAvailable);
// router.post(`/generateDrawingAV2`,authMiddleware, DrawingController.generateDrawing);
// router.get(`/get-drawing/:adsId`, drawingDownloadLimiter, DrawingController.downloadADSDrawingFile);
module.exports = router;