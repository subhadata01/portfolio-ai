const express = require('express');
const multer = require('multer');
const {
  uploadResume,
  getResumeContext,
  getPortfolio
} = require("../controllers/portfolioController");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();
router.post("/upload", upload.single("file"), uploadResume);
router.post("/extractResumeContext", getResumeContext);
router.post("/getPortfolio", getPortfolio);


module.exports = router;