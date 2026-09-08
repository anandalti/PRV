const express = require('express');
const UICalculationsController = require('../controllers/UICalculationsController');
const router = express.Router();
// console.log(' >>>>>>>>>>>>>>>. 0000000000 1111111111111 >>>>>>>>>>> ')
router.post('/iso4126', UICalculationsController.getISO4126Calculations);
router.post('/tup', UICalculationsController.getTup);
router.post('/14/flowcapacity', UICalculationsController.get14flowCapacity);
router.post('/17/calcSpecVolMix', UICalculationsController.get17SpecVolMix);
router.post('/18/flowcapacity', UICalculationsController.get18flowCapacity);
router.post('/21/flowcapacity', UICalculationsController.get21flowCapacity);
router.post('/chkcriticalpressuretemperature', UICalculationsController.checkCriticalPressureTemperature);
router.post('/popup/firesize/surfacearea', UICalculationsController.CalculateFireSizePopupSurfaceArea);
router.post('/popup/api2000/pressure', UICalculationsController.CalculateAPI2000PopupPressure);
router.get('/restrictedlift/getLiftRestrictions', UICalculationsController.getRestrictedLiftRestrictions);
router.get('/restrictedlift/RLCapacity', UICalculationsController.getRLCapacity);
// router.get('/restrictedlift/getEMLiftRestrictions', UICalculationsController.getEMRestrictedLiftRestrictions);
router.get('/restrictedlift/EMRLCapacity', UICalculationsController.getEMRLCapacity);

module.exports = router;