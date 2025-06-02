const express = require("express");
const videoController = require('../controllers/videoController.js');
const errorHandler = require('../middleware/errorHandler.js');

const router = express.Router();

// Upload video
router.post('/upload', videoController.uploadVideoMiddleware, videoController.uploadVideo);

// Get video URL
router.get('/:filename/url', videoController.getVideoUrl);

// Delete video
router.delete('/:filename', videoController.deleteVideo);

router.use(errorHandler);

module.exports = router;