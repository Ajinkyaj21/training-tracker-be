const {getTechnology, getMyTrainingQuery, traineesDashboardQuery, completionPercentageQuery, getCourses, addCourses , getTopics , addTopics , editTopics , topicExists ,courseExists,setStatus ,deleteTopic , addSessions , getSessions} = require('../models/technologiesModel');
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
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
const deleteTopicCtrl = async(req, res) => {
    try {
        const { topic_id } = req.params;
        const results = await deleteTopic(topic_id);
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

const getSessionsCtrl =  async(req, res) => {
    try {
        const results = await getSessions();
        if (!results.error) {
            return sendSuccessRes(res, {result: results});
        }
        return sendFailRes(res, { message: results.errorMessage });
    } catch (error) {
        console.error("Error in get technology Ctrl..:", error);
        return sendFailRes(res, { message: "Internal Server Error" });
    }
    }
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const addCoursesCtrl = async(req , res)=>{
    try {
    const userId = req.user.user_id;
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


const addSessionsCtrl = async(req , res)=>{
    try {
    const userId = req.user.user_id;
    
    let { sessionUrl ,name ,date, speaker , tagsJson } = req.body;   
    if (!({ sessionUrl ,name ,date, speaker , tagsJson})) {
        return sendFailRes(res, { message: "All fields are necessary..." } );
    }    
    const tags = JSON.stringify(tagsJson);
    const results = await addSessions(sessionUrl ,name ,date, speaker , tags, userId);
    return sendSuccessRes(res, {result: `Course added successfully`});
    } catch (error) {
        console.error(error);
        return sendFailRes(res, { message: "Unable to insert courses" }, 500);
    }
}

// const addTopicsCtrl = async(req , res)=>{
//     const tech_id = req.params.tech_id;
//     const {topic , article , youtube , practice , assignments } = req.body;
//     try{
//     if(!(topic && tech_id)){
//         return sendFailRes(res, { message: "All fields are necessary..." } );
//     }
//      app.post('/upload/image', upload.single('image'), async (req, res) => {
//         try {
//             const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME); 
   
//             const imagePath = req.file.path;
//             const blobName = req.file.originalname;
//             const blockBlobClient = containerClient.getBlockBlobClient(blobName);

//             await blockBlobClient.uploadFile(imagePath);

//             fs.unlinkSync(imagePath);

//             res.status(200).json({ message: 'Image uploaded successfully!', url: `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER_NAME}/${blobName}` });
//         } catch (error) {
//             console.error('Error uploading image to Azure Blob Storage:', error);
//             res.status(500).json({ error: 'Failed to upload image.' });
//         }
//     });
//     const topicExistsCtrl = await topicExists(topic);
//     if(topicExistsCtrl.length > 0){
//         return sendFailRes(res, { message: "Topic already exists" }, 500);
//     }
//     const results = await addTopics(topic , article , youtube , practice , assignments , tech_id);
//     return sendSuccessRes(res, {result: `Topic added successfully`});
//     } catch (error) {
//         console.error(error);
//         return sendFailRes(res, { message: "Unable to insert topics" }, 500);
//     }
// }
const addTopicsCtrl = async (req, res) => {
    const tech_id = req.params.tech_id;
    const { topic, youtube, assignments } = req.body;
    const { article, practice } = req.files || {}; 

    try {
        if (!(topic && tech_id)) {
            return sendFailRes(res, { message: "All fields are necessary..." });
        }

        const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);

        let articleUrl = null;
        let practiceUrl = null;

        // Upload article if present
        if (article && article[0]) {
            const articlePath = article[0].path;
            const articleBlobName = article[0].filename; 
            const articleBlockBlobClient = containerClient.getBlockBlobClient(articleBlobName);

            await articleBlockBlobClient.uploadFile(articlePath);
            fs.unlinkSync(articlePath);

            articleUrl = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER_NAME}/${articleBlobName}`;
        } else if (req.body.article) { 
            articleUrl = req.body.article;
        }

        // Upload practice if present
        if (practice && practice[0]) { 
            const practicePath = practice[0].path;
            const practiceBlobName = practice[0].filename;
            const practiceBlockBlobClient = containerClient.getBlockBlobClient(practiceBlobName);

            await practiceBlockBlobClient.uploadFile(practicePath);
            fs.unlinkSync(practicePath);

            practiceUrl = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER_NAME}/${practiceBlobName}`;
        } else if (req.body.practice) { 
            practiceUrl = req.body.practice;
        }

        const topicExistsCtrl = await topicExists(topic);
        if (topicExistsCtrl.length > 0) {
            return sendFailRes(res, { message: "Topic already exists" }, 500);
        }
        console.log("The data is ----> ",{topic, articleUrl, youtube, practiceUrl, assignments, tech_id});
        const results = await addTopics(topic, articleUrl, youtube, practiceUrl, assignments, tech_id);

        console.log("Topic added successfully: ", results);
        return sendSuccessRes(res, { result: "Topic added successfully" });
    } catch (error) {
        console.error('Error in addTopicsCtrl:', error);
        return sendFailRes(res, { message: "Unable to insert topics" }, 500);
    }
};

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
    const { topic, youtube, assignments, tech_topic_id } = req.body;
    const { article, practice } = req.files || {}; 
    try {
        if (!tech_id || !tech_topic_id) {
            return sendFailRes(res, { message: "tech_id and tech_topic_id are necessary" });
        }

        if (!(topic || article || youtube || practice || assignments)) {
            return sendFailRes(res, { message: "At least one field to update must be provided..." });
        }

        const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);

        let articleUrl = null;
        let practiceUrl = null;

        // Upload article if present
        if (article && article[0]) {
            const articlePath = article[0].path;
            const articleBlobName = article[0].filename;
            const articleBlockBlobClient = containerClient.getBlockBlobClient(articleBlobName);

            await articleBlockBlobClient.uploadFile(articlePath);
            fs.unlinkSync(articlePath);

            articleUrl = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER_NAME}/${articleBlobName}`;
        } else if (req.body.article) { 
            articleUrl = req.body.article;
        }

        // Upload practice if present
        if (practice && practice[0]) { 
            const practicePath = practice[0].path;
            const practiceBlobName = practice[0].filename;
            const practiceBlockBlobClient = containerClient.getBlockBlobClient(practiceBlobName);

            await practiceBlockBlobClient.uploadFile(practicePath);
            fs.unlinkSync(practicePath);

            practiceUrl = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER_NAME}/${practiceBlobName}`;
        } else if (req.body.practice) { 
            practiceUrl = req.body.practice;
        }
        console.log("The edited data is ----> ",{topic, articleUrl, youtube, practiceUrl, assignments, tech_id, tech_topic_id});
        const results = await editTopics(topic, articleUrl, youtube, practiceUrl, assignments, tech_id, tech_topic_id);

        console.log("Topic updated successfully: ", results);
        return sendSuccessRes(res, { result: `Topic updated successfully` });
    } catch (error) {
        console.error('Error in editTopicCtrl:', error);
        return sendFailRes(res, { message: "Unable to update topics" }, 500);
    }
};
const uploadCtrl = async (req, res) => {
    const tech_id = req.params.tech_id;
    const {  topic, youtube, tech_topic_id , articleUrl , practiceUrl} = req.body;
    const { assignments  } = req.files || {}; 
    try {
        if (!tech_id || !tech_topic_id) {
            return sendFailRes(res, { message: "tech_id and tech_topic_id are necessary" });
        }
        const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_STORAGE_CONTAINER_NAME);

        let assignmentsUrl = null;
        // Upload article if present
        if (assignments && assignments[0]) {
            const articlePath = assignments[0].path;
            const articleBlobName = assignments[0].filename;
            const articleBlockBlobClient = containerClient.getBlockBlobClient(articleBlobName);

            await articleBlockBlobClient.uploadFile(articlePath);
            fs.unlinkSync(articlePath);

            assignmentsUrl = `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_STORAGE_CONTAINER_NAME}/${articleBlobName}`;
        } else if (req.body.assignment) { 
            assignmentsUrl = req.body.assignment;
        }
        const results = await editTopics(topic, articleUrl, youtube, practiceUrl, assignmentsUrl, tech_id, tech_topic_id);

        console.log("Topic updated successfully: ", results);
        return sendSuccessRes(res, { result: `Assignment uploaded successfully` });
    } catch (error) {
        console.error('Error in editTopicCtrl:', error);
        return sendFailRes(res, { message: "Unable to upload assignment" }, 500);
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


module.exports = { getTechnologyCtrl, getMyTrainingCtrl, traineesDashboardCtrl, completionPercentageCtrl , getCoursesCtrl ,addCoursesCtrl , getTopicsCtrl , addTopicsCtrl , addTopicsCtrl, editTopicCtrl , setStatusCtrl , uploadCtrl , deleteTopicCtrl , addSessionsCtrl , getSessionsCtrl};
