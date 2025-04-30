const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get('/courses', searchController.searchCourses);
router.get('/filter', searchController.filterCourses);

module.exports = router;