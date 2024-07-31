const express = require("express");
const {getTechnologyCtrl, getMyTrainingCtrl, traineesDashboardCtrl, getCoursesCtrl, addCoursesCtrl } = require("../controllers/technologiesController");
const technologyRouter = express.Router();
const { adminAuthMiddleware } = require("../middlewares/adminMiddleware");
const { userAuthMiddleware } = require("../middlewares/userMiddleware");

// 4 .Get Technology Dropdown - Admin Page
technologyRouter.get('/', adminAuthMiddleware, getTechnologyCtrl);

technologyRouter.get('/getCourses', getCoursesCtrl);

technologyRouter.post('/addNewCourse',adminAuthMiddleware , addCoursesCtrl);

// My training part for dashboard page
technologyRouter.get('/myTraining', userAuthMiddleware, getMyTrainingCtrl);

technologyRouter.get('/traineeDashboard', userAuthMiddleware, traineesDashboardCtrl);


module.exports = { technologyRouter };
