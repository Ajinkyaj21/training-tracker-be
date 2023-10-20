const { executeQuery } = require("../db_config/db_schema.js");
const {con} = require('../db_config/db_schema.js')
const beginTransaction = () => {
    return new Promise((resolve, reject) => {
        con.beginTransaction((err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};
const commitTransaction = () => {
    return new Promise((resolve, reject) => {
        con.commit((err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};
const rollbackTransaction = (error) => {
    return new Promise((resolve, reject) => {
        con.rollback(() => {
            reject(error);
        });
    });
};
const assignDueDateQuery = async (due_date , activity_id) => {
    try {
        const updateQuery = `UPDATE training_plan tp
                             JOIN activities_master am ON tp.activity_id = am.activity_id
                             SET tp.due_date = ?
                             WHERE tp.activity_id = ?`;
        return executeQuery(updateQuery, due_date ,activity_id );      
    } catch (error) {
        console.error("Error in assignDueDateQuery:", error);
        throw error;
    }
}
const markActivitiesQuery = async (activity_id) => {
    try {
        const updateQuery = `
            UPDATE training_plan tp
            JOIN activities_master am ON tp.activity_id = am.activity_id
            SET tp.required = false
            WHERE tp.activity_id = ?`;
        return executeQuery(updateQuery, activity_id);
    } catch (error) {
        console.log("Error in the activities model query");
        throw error;
    }
}
const completionPercentage = async(trainee_id)=>{
    try {
        const percentageQuery = `SELECT
        u.user_id,
        u.user_name,
        COUNT(tp.training_plan_id) AS total_activities,
        SUM(tp.required) AS completed_activities,
        (SUM(tp.required) / COUNT(tp.training_plan_id)) * 100 AS completion_percentage
      FROM
        users u
      INNER JOIN
        trainee_trainer_tech ttt ON u.user_id = ttt.trainee_id
        INNER JOIN
        training_plan tp ON ttt.ttt_id = tp.ttt_id
      WHERE u.user_id = ?
      GROUP BY
        u.user_id, u.user_name
      `
      return executeQuery(percentageQuery, trainee_id);
    } catch (error) {
        console.log("Error in the completion percentage query");
        throw error;
    }
}
const setActivitiesRequiredQuery = async (activity_id) => {
    try {
        const selectQuery = `
            UPDATE training_plan tp
            JOIN activities_master am ON tp.activity_id = am.activity_id
            SET tp.required = false
            WHERE tp.activity_id = ?`;
        return executeQuery(selectQuery, activity_id);
    } catch (error) {
        console.log("Error in the activities model query");
        throw error;
    }
}
const getActivitiesByTechnologyQuery = async(params)=>{
    try {
        const selectQuery = `SELECT tm.tech_id , 
        tm.technology AS technology,
        ttm.tech_topic_id , 
        ttm.topic AS topic,
        tst.tech_sub_topic_id , 
        tst.sub_topic AS sub_topic,
        am.activity_id , 
        am.activity AS activity
        FROM
        technologies_master tm
        LEFT JOIN
        tech_topics_master ttm ON tm.tech_id = ttm.tech_id
        LEFT JOIN
        tech_sub_topics_master tst ON ttm.tech_topic_id = tst.tech_topic_id
        LEFT JOIN
        activities_master am ON tst.tech_sub_topic_id = am.sub_topic_id
        WHERE tm.tech_id = ? AND am.activity_id is NOT NULL 
        `
        ;
        return executeQuery(selectQuery ,params);
    } catch (error) {
        console.log("Error in the activities model query");
        throw error;
    }
}

const saveTpModel = async(params, user_id) => {
    try {
        await beginTransaction();
        const {tech_id , trainee_id , trainer_id, activities} = params;
        const paramsForTTT = [tech_id , trainee_id , trainer_id, user_id];
        const paramsForTP = activities
        const insertQueryTTT = `INSERT INTO trainee_trainer_tech (tech_id, trainee_id, trainer_id, created_by) VALUES (?, ?, ?,?)`;
        const trainee_trainer_tech_results = await executeQuery(insertQueryTTT, paramsForTTT);
        if (trainee_trainer_tech_results.error) {
            await rollbackTransaction(trainee_trainer_tech_results.error);
            throw trainee_trainer_tech_results.error; 
        }
        console.log("Inserted ttt data")
        const tttId = trainee_trainer_tech_results.insertId
        console.log(tttId)
        // const getTTTIdResult = await executeQuery(`SELECT ttt_id FROM trainee_trainer_tech ORDER BY created_at DESC LIMIT 1`);

        //const tttId = getTTTIdResult[0].ttt_id;

        const values = paramsForTP.map(param => [tttId, param.activity_id, param.due_date, param.required,1,user_id]);
        console.log("THE USER ID IS -->",user_id);
        
        const insertQuery = `INSERT INTO training_plan(ttt_id , activity_id, due_date, required, status_id, created_by) VALUES ?`;
        const tp_results = await executeQuery(insertQuery, [values]);
        await commitTransaction();

        return {
            success: true,
            message: "Data inserted successfully into both tables."
        };
    } catch (error) {
        console.error("Error in assignTechnologyQuery:", error);
        await rollbackTransaction(error); 
        return {
            success: false,
            error: true,
            errorMessage: error.message
        }
    }
};

const getTrainingActModel= async(params) =>{
    try {
        const selectQuery = ` SELECT  
        technologies_master.technology AS technology,
        activities_master.activity AS activity_name,
        tech_topics_master.topic AS topic,
        tech_sub_topics_master.sub_topic AS sub_topic,
        training_plan.start_date AS start_date,
        training_plan.due_date AS due_date,
        training_plan.end_date AS end_date,
        comments.comment AS comments,
        activities_master.resource_link AS resource_link,
        activities_master.description AS description,
        status_master.status AS status
        FROM training_plan
        INNER JOIN activities_master ON training_plan.activity_id = activities_master.activity_id
        INNER JOIN tech_sub_topics_master ON activities_master.sub_topic_id = tech_sub_topics_master.tech_sub_topic_id
        INNER JOIN tech_topics_master ON tech_sub_topics_master.tech_topic_id = tech_topics_master.tech_topic_id
        INNER JOIN technologies_master ON tech_topics_master.tech_id = technologies_master.tech_id
        LEFT JOIN comments ON training_plan.training_plan_id = comments.training_plan_id
        INNER JOIN status_master ON training_plan.status_id = status_master.status_id
        INNER JOIN trainee_trainer_tech ON training_plan.ttt_id = trainee_trainer_tech.ttt_id
        INNER JOIN users ON trainee_trainer_tech.trainee_id = users.user_id
        WHERE trainee_trainer_tech.trainee_id = ? `;
        return executeQuery(selectQuery ,params);

    } catch (error) {
        console.log("Error in the activities model query");
        throw error;
    }

}

module.exports = { assignDueDateQuery , markActivitiesQuery , completionPercentage , getActivitiesByTechnologyQuery , setActivitiesRequiredQuery , saveTpModel, getTrainingActModel}
