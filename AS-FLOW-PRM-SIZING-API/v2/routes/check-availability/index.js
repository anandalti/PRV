const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const CheckAvailabiltyController = require("../../controllers/check-availability/CheckAvailabiltyController.js");
const authMiddleware = require("../../middlewares/auth/authMiddleware.js");

router.post(
  "/validate-files",
  upload.array("file"),
  CheckAvailabiltyController.validateFiles,
);

router.post(
  "/import-files",
  upload.array("file"),
  CheckAvailabiltyController.importFiles,
);

router.post(
  "/save-tpc-data",
  authMiddleware,
  CheckAvailabiltyController.saveTPCData,
);

router.post(
  "/get-tpc-data",
  authMiddleware,
  CheckAvailabiltyController.getTPCData,
);

router.post("/get-boms", CheckAvailabiltyController.getUpperAndLowerBOMs);

router.post(
  "/import-lead-times",
  upload.single("file"),
  CheckAvailabiltyController.importLeadTimes,
);

router.get("/get-lead-times", CheckAvailabiltyController.getLeadTimes);

router.post("/update-lead-times", CheckAvailabiltyController.updateLeadTimes);

router.post("/save-atp-results", CheckAvailabiltyController.saveATPResults);

router.post("/get-atp-results", CheckAvailabiltyController.getATPResults);

module.exports = router;
