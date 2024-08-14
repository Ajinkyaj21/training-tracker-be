const {getTechnology, getMyTrainingQuery, traineesDashboardQuery, completionPercentageQuery, getCourses, addCourses , getTopics , addTopics , editTopics , topicExists ,courseExists,setStatus} = require('../models/technologiesModel');
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
            const processedResults = results.map(course => {
                // if (course.image && Buffer.isBuffer(course.image)) {
                //     const base64Image = course.image.toString('base64');
                //     const mimeType = 'data:image/svg+xml;base64'; 
                //     return {
                //         ...course,
                //         image: `${base64Image}`
                //     };
                // }
                return course;
            });

            return sendSuccessRes(res, { result: processedResults });
        }

        return sendFailRes(res, { message: results.errorMessage });
    } catch (error) {
        console.error("Error in getCoursesCtrl:", error);
        return sendFailRes(res, { message: "Internal Server Error" });
    }
};

const getTopicsCtrl =  async(req, res) => {
try {
    const topic_id = req.params.topic_id;
    const results = await getTopics(topic_id);
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
    const userId = req.user.user_id;
    console.log("The user id is --> ",userId);
    let { technology ,image ,description, is_admin: isAdmin } = req.body;   
    if (!(technology && image && description)) {
        return sendFailRes(res, { message: "All fields are necessary..." } );
    }
    const courseExistsCtrl = await courseExists(technology);
    if(courseExistsCtrl.length > 0){
        return sendFailRes(res, { message: "Course already exists" }, 500);
    }
    const results = await addCourses(technology , image , description , userId);
    return sendSuccessRes(res, {result: `Course added successfully`});
    } catch (error) {
        console.error(error);
        return sendFailRes(res, { message: "Unable to insert courses" }, 500);
    }
}

const addTopicsCtrl = async(req , res)=>{
    const tech_id = req.params.tech_id;
    const {topic , article , youtube , practice , assignments } = req.body;
    try{
    if(!(topic && tech_id)){
        return sendFailRes(res, { message: "All fields are necessary..." } );
    }
    const topicExistsCtrl = await topicExists(topic);
    if(topicExistsCtrl.length > 0){
        return sendFailRes(res, { message: "Topic already exists" }, 500);
    }
    const results = await addTopics(topic , article , youtube , practice , assignments , tech_id);
    return sendSuccessRes(res, {result: `Topic added successfully`});
    } catch (error) {
        console.error(error);
        return sendFailRes(res, { message: "Unable to insert topics" }, 500);
    }
}

const setStatusCtrl = async(req , res)=>{
    try {
        const topic_id = req.params.topic_id;
        const {status} = req.body;

        const results = await setStatus(topic_id , status);
        return sendSuccessRes(res, {result: results});
    } catch (error) {
        console.error(error);
        return sendFailRes(res, { message: "Unable to update topics" }, 500);
    }
}
const editTopicCtrl = async (req, res) => {
    const tech_id = req.params.tech_id;
    const { topic, article, youtube, practice, assignments, tech_topic_id } = req.body;
    try {
        if (!tech_id || !tech_topic_id) {
            return sendFailRes(res, { message: "tech_id and tech_topic_id are necessary" });
        }
        if (!(topic || article || youtube || practice || assignments)) {
            return sendFailRes(res, { message: "At least one field to update must be provided..." });
        }
        const topicExistsCtrl = await topicExists(topic);
        if(topicExistsCtrl.length > 0){
        return sendFailRes(res, { message: "Topic already exists" }, 500);
        }
        const results = await editTopics(topic, article, youtube, practice, assignments, tech_id, tech_topic_id);
        return sendSuccessRes(res, { result: `Topic updated successfully` });
    } catch (error) {
        console.error(error);
        return sendFailRes(res, { message: "Unable to update topics" }, 500);
    }
};
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


module.exports = { getTechnologyCtrl, getMyTrainingCtrl, traineesDashboardCtrl, completionPercentageCtrl , getCoursesCtrl ,addCoursesCtrl , getTopicsCtrl , addTopicsCtrl , addTopicsCtrl, editTopicCtrl , setStatusCtrl};
