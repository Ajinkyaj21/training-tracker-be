const { executeQuery } = require("../utils/exec_db_query");

// 4 .Get Technology Dropdown - Admin Page
const getTechnology = async() => {
    const query = `SELECT tech_id , technology FROM technologies_master`
    return await executeQuery(query);
}
const getCourses = async() =>{
    const query = `SELECT tech_id , technology , image , description , DATE(created_at) AS created_at FROM technologies_master`
    return await executeQuery(query);
}
const getTopics = async(topic_id) =>{
    const query = `SELECT tech_topic_id , tech_id , topic , Article , Youtube , Practice , Assignments , DATE(created_at) AS created_at  FROM tech_topics_master 
    WHERE  tech_id = ?`
    const params = [topic_id]
    return await executeQuery(query , params);
}

const addCourses = async(technology , imageFile , description , userId) =>{
    const query = 'INSERT INTO technologies_master(technology ,image , description , created_by , created_at) VALUES(? , ? , ? , ? , ?)'
    const now = new Date();
    const params = [ technology , imageFile , description ,userId ,now]
    return executeQuery(query, params);
}
const addTopics = async(topic , article , youtube , practice , assignments , tech_id)=>{
    const query = 'INSERT INTO tech_topics_master(topic , Article , Youtube , Practice , Assignments , created_at , tech_id) VALUES(? , ? , ? , ? , ? , ? , ?)';
    const now = new Date();
    const params = [topic , article , youtube , practice , assignments , now , tech_id];
    return executeQuery(query , params)
}

const topicExists = async(topic)=>{
    const query = 'SELECT * FROM tech_topics_master WHERE topic = ?'
    const params = [topic];
    return executeQuery(query , params);
} 

const courseExists = async(technology)=>{
    const query = 'SELECT * FROM technologies_master WHERE technology = ?'
    const params = [technology];
    return executeQuery(query , params);
}

const editTopics = async(topic, article, youtube, practice, assignments, tech_id, tech_topic_id) => {
    let query = `UPDATE tech_topics_master SET `;
    const params = [];
    if (topic) {
        query += `topic = ?, `;
        params.push(topic);
    }
    if (article) {
        query += `Article = ?, `;
        params.push(article);
    }
    if (youtube) {
        query += `Youtube = ?, `;
        params.push(youtube);
    }
    if (practice) {
        query += `Practice = ?, `;
        params.push(practice);
    }
    if (assignments) {
        query += `Assignments = ?, `;
        params.push(assignments);
    }
    query = query.slice(0, -2);

    query += `, created_at = ? WHERE tech_id = ? AND tech_topic_id = ?`;
    const now = new Date();
    params.push(now, tech_id, tech_topic_id);
    return executeQuery(query, params);
};


// My training part for dashboard page
const getMyTrainingQuery = async(userId) => {
    const query = `WITH cte AS ( SELECT  t.technology,
            SUM(CASE WHEN tp.status_id = (SELECT status_id FROM status_master WHERE status = 'completed') THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN tp.status_id = (SELECT status_id FROM status_master WHERE status = 'in_progress') THEN 1 ELSE 0 END) AS in_progress,
            SUM(CASE WHEN tp.status_id = (SELECT status_id FROM status_master WHERE status = 'not_started') THEN 1 ELSE 0 END) AS not_started,
            SUM(CASE WHEN tp.status_id = (SELECT status_id FROM status_master WHERE status = 'done') THEN 1 ELSE 0 END) AS not_reviewed,
            SUM(CASE WHEN tp.status_id = (SELECT status_id FROM status_master WHERE status = 'delayed') THEN 1 ELSE 0 END) AS delayed_,
            (SUM(CASE WHEN tp.status_id = (SELECT status_id FROM status_master WHERE status = 'completed') THEN 1 ELSE 0 END) / COUNT(*)) * 100 AS percentage_of_activities
        FROM trainee_trainer_tech ttt
        JOIN technologies_master t ON ttt.tech_id = t.tech_id
        JOIN training_plan tp ON ttt.ttt_id = tp.ttt_id
        WHERE ttt.trainee_id = ? 
        GROUP BY t.technology
    )
    SELECT technology, completed, in_progress, not_started, delayed_, not_reviewed, percentage_of_activities FROM cte;
    `;
    return await executeQuery(query, [userId]);
}

// all trinees under perticular trainer
const traineesDashboardQuery = (params) => {
    const query = ` SELECT
    SUM(CASE WHEN tp.status_id = (SELECT status_id FROM status_master WHERE status='completed') THEN 1 ELSE 0 END) AS completed,
    SUM(CASE WHEN tp.status_id = (SELECT status_id FROM status_master WHERE status='in_progress') THEN 1 ELSE 0 END) AS in_progress,
    SUM(CASE WHEN tp.status_id = (SELECT status_id FROM status_master WHERE status='not_started') THEN 1 ELSE 0 END) AS not_started,
    SUM(CASE WHEN tp.status_id = (SELECT status_id FROM status_master WHERE status='delayed') THEN 1 ELSE 0 END) AS delayed_,
    SUM(CASE WHEN tp.status_id = (SELECT status_id FROM status_master WHERE status='done') THEN 1 ELSE 0 END) AS not_reviewed
    FROM technologies_master t
    JOIN trainee_trainer_tech ttt ON t.tech_id = ttt.tech_id
    JOIN training_plan tp ON ttt.ttt_id = tp.ttt_id
    WHERE ttt.trainer_id = ?;`;
    return executeQuery(query, params);
}

module.exports = { getTechnology, getMyTrainingQuery, traineesDashboardQuery , getCourses , addCourses , getTopics , addTopics , editTopics, topicExists , courseExists};