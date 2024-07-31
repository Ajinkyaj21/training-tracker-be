const {getTechnology, getMyTrainingQuery, traineesDashboardQuery, completionPercentageQuery, getCourses, addCourses} = require('../models/technologiesModel');
const { sendSuccessRes, sendFailRes} = require('../utils/responses');
// 4 .Get Technology Dropdown - Admin Page
const getTechnologyCtrl = async(_, res) => {
    try {
        const results = await getTechnology();
        if (!results.error) {
            return sendSuccessRes(res, {result: results});
        }
        return sendFailRes(res, { message: results.errorMessage });
    } catch (error) {
        console.error("Error in get technology Ctrl..:", error);
        return sendFailRes(res, { message: "Internal Server Error" });
    }
}
const getCoursesCtrl = async(_, res) => {
    try {
        const results = await getCourses();
        if (!results.error) {
            return sendSuccessRes(res, {result: results});
        }
        return sendFailRes(res, { message: results.errorMessage });
    } catch (error) {
        console.error("Error in get technology Ctrl..:", error);
        return sendFailRes(res, { message: "Internal Server Error" });
    }
}
const getTopicsCtrl =  async(_, res) => {
try {
    const results = await getTopics();
    if (!results.error) {
        return sendSuccessRes(res, {result: results});
    }
    return sendFailRes(res, { message: results.errorMessage });
} catch (error) {
    console.error("Error in get technology Ctrl..:", error);
    return sendFailRes(res, { message: "Internal Server Error" });
}
}

const addCoursesCtrl = async(req , res)=>{
    try {
    let { technology ,image ,description, is_admin: isAdmin } = req.body;   
    if (!(technology && image && description)) {
        return sendFailRes(res, { message: "All fields are necessary..." } );
    }
        const results = await addCourses(technology , image , description , userId);
        return sendSuccessRes(res, {result: `Course added successfully`});
    } catch (error) {
        console.error(error);
        return sendFailRes(res, { message: "Unable to insert courses" }, 500);
    }
}

// Boxes with percentage for each box(eg.subject , all etc)
const getMyTrainingCtrl = async (req, res) => {
    try {
        const results = await getMyTrainingQuery(req.user.user_id);
        if (!results.error) {
            const tempResults = results;

            let totalCompleted = 0;
            let totalInProgress = 0;
            let totalNotStarted = 0;
            let totalDelayed = 0;
            let totalNotReviewed = 0;

            tempResults.forEach((result) => {
                totalCompleted += parseInt(result.completed);
                totalInProgress += parseInt(result.in_progress);
                totalNotStarted += parseInt(result.not_started);
                totalDelayed += parseInt(result.delayed_);
                totalNotReviewed += parseInt(result.not_reviewed);

            });

            const totalActivities = totalCompleted + totalInProgress + totalNotStarted + totalDelayed + totalNotReviewed;

            // tempResults.forEach((result) => {
            //     result['percentage_of_activities'] = (result.completed / totalActivities) * 100;
            // });
            const allObject = {
                'technology': 'All',
                'completed': totalCompleted,
                'in_progress': totalInProgress,
                'not_started': totalNotStarted,
                delayed_: totalDelayed,
                'not_reviewed': totalNotReviewed,
                'percentage_of_completed_activities': (totalCompleted / totalActivities) * 100
            };

            tempResults.push(allObject);
            return sendSuccessRes(res, {result: tempResults});
            // return res.send(tempResults);
        }
        return sendFailRes(res, { message: results.errorMessage });
    } catch (error) {
        console.error("Error in Get My training plan..:", error);
        return sendFailRes(res, { message: "Internal Server Error" });
    }
}

const traineesDashboardCtrl = async(req, res) => {
    try {
        const results = await traineesDashboardQuery(req.user.user_id);
        if (!results.error) {
            return sendSuccessRes(res, {result: results});
        }
        return sendFailRes(res, { message: results.errorMessage });
    } catch (error) {
        console.error("Error in Get traineesDashboardCtrl ..:", error);
        return sendFailRes(res, { message: "Internal Server Error" });
    }
}

const completionPercentageCtrl = async(req, res) => {
    try {
        const results = await completionPercentageQuery([req.user.user_id, req.body.tech_id]);
        if (!results.error) {
            return sendSuccessRes(res, {result: results});
        }
        return sendFailRes(res, { message: results.errorMessage });
    } catch (error) {
        console.error("Error in Get traineesDashboardCtrl ..:", error);
        return sendFailRes(res, { message: "Internal Server Error" });
    }
}


module.exports = { getTechnologyCtrl, getMyTrainingCtrl, traineesDashboardCtrl, completionPercentageCtrl , getCoursesCtrl ,addCoursesCtrl , getTopicsCtrl};
