const path = require('path');
const express = require("express");
const multer = require('multer');
const {getTechnologyCtrl, getMyTrainingCtrl, traineesDashboardCtrl, getCoursesCtrl, addCoursesCtrl , getTopicsCtrl, addTopicsCtrl , editTopicCtrl, setStatusCtrl ,uploadCtrl} = require("../controllers/technologiesController");
const technologyRouter = express.Router();
const { adminAuthMiddleware } = require("../middlewares/adminMiddleware");
const { userAuthMiddleware } = require("../middlewares/userMiddleware");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fs = require("fs"); // Or `import fs from "fs";` with ESM
        const fileFolder = path.join(__dirname, '..', 'tmp');
        if (!fs.existsSync(fileFolder)) {
            fs.mkdirSync(fileFolder)
        }
        const dir = fileFolder;

        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
//const storage = multer.diskStorage({
//  destination: (req, file, cb) => {
//      cb(null, path.join(__dirname, '..', 'tmp'));
//  },
//  filename: (req, file, cb) => {
//      cb(null, file.originalname + `${Date.now() + '-' + Math.round(Math.random() * 1E9)}`);  
//  }
//});

const upload = multer({ storage: storage });

// 4 .Get Technology Dropdown - Admin Page
technologyRouter.get('/', adminAuthMiddleware, getTechnologyCtrl);

technologyRouter.get('/getCourses', getCoursesCtrl);

technologyRouter.get('/getTopics/:topic_id', getTopicsCtrl);

technologyRouter.post('/addNewCourse',adminAuthMiddleware , addCoursesCtrl);

technologyRouter.post('/addNewTopic/:tech_id', adminAuthMiddleware, upload.fields([
    { name: 'article', maxCount: 1 },
    { name: 'practice', maxCount: 1 }
]), addTopicsCtrl);

technologyRouter.put('/editTopic/:tech_id', adminAuthMiddleware,upload.fields([
    { name: 'article', maxCount: 1 },
    { name: 'practice', maxCount: 1 }]), editTopicCtrl);

technologyRouter.put('/uploadAssignment/:tech_id',upload.fields([
    { name: 'assignments', maxCount: 1 }]), uploadCtrl);

technologyRouter.put('/updateStatus/:topic_id', setStatusCtrl);

// My training part for dashboard page
technologyRouter.get('/myTraining', userAuthMiddleware, getMyTrainingCtrl);

technologyRouter.get('/traineeDashboard', userAuthMiddleware, traineesDashboardCtrl);


module.exports = { technologyRouter };
