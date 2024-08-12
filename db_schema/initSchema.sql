CREATE TABLE IF NOT EXISTS users (
    user_id INT NOT NULL AUTO_INCREMENT,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id)
    );
CREATE TABLE IF NOT EXISTS technologies_master (
    tech_id INT NOT NULL AUTO_INCREMENT,
    technology VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tech_id)
    );
CREATE TABLE IF NOT EXISTS tech_topics_master (
    tech_topic_id INT NOT NULL AUTO_INCREMENT,
    tech_id INT NOT NULL,
    topic VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ,
    PRIMARY KEY (tech_topic_id),
    FOREIGN KEY (tech_id) REFERENCES technologies_master (tech_id)
    );
CREATE TABLE IF NOT EXISTS tech_sub_topics_master (
    tech_sub_topic_id INT NOT NULL AUTO_INCREMENT,
    tech_topic_id INT NOT NULL,
    sub_topic VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (tech_sub_topic_id),
    FOREIGN KEY (tech_topic_id) REFERENCES tech_topics_master (tech_topic_id)
    );
CREATE TABLE IF NOT EXISTS activities_master (
    activity_id INT NOT NULL AUTO_INCREMENT,
    sub_topic_id INT NOT NULL,
    activity VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    resource_link VARCHAR(255) NOT NULL,
    sequence INT NOT NULL , 
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (activity_id),
    FOREIGN KEY (sub_topic_id) REFERENCES tech_sub_topics_master (tech_sub_topic_id)
);
CREATE TABLE IF NOT EXISTS status_master (
    status_id INT NOT NULL AUTO_INCREMENT,
    status VARCHAR(63) NOT NULL,
    status_display VARCHAR(63) NOT NULL COMMENT 'display name for the statuses',
    trainee_select BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'to flag what status the trainee can select for updating the status',
    trainer_select BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'to flag what status the trainee can select for updating the status',
    sequence INT NOT NULL,
    created_by INT NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (status_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
) COMMENT = 'master list of statuses to be used in the system';
CREATE TABLE IF NOT EXISTS trainee_trainer_tech (
    ttt_id INT NOT NULL AUTO_INCREMENT,
    trainee_id INT NOT NULL,
    trainer_id INT NOT NULL,
    tech_id INT NOT NULL,
    created_by INT NOT NULL , 
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ttt_id),
    FOREIGN KEY (trainee_id) REFERENCES users (user_id),
    FOREIGN KEY (trainer_id) REFERENCES users (user_id),
    FOREIGN KEY (tech_id) REFERENCES technologies_master (tech_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id) , 
    UNIQUE(tech_id , trainer_id ,trainee_id)
);
CREATE TABLE IF NOT EXISTS training_plan (
    training_plan_id INT NOT NULL AUTO_INCREMENT,
    ttt_id INT NOT NULL,
    activity_id INT NOT NULL,
    due_date DATETIME NOT NULL,
    start_date DATETIME,
    end_date DATETIME,
    status_id INT NOT NULL ,
    created_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    required BOOLEAN NOT NULL DEFAULT 1,
    modified_by INT,
    modified_at DATETIME,
    PRIMARY KEY (training_plan_id),
    FOREIGN KEY (ttt_id) REFERENCES trainee_trainer_tech (ttt_id),
    FOREIGN KEY (activity_id) REFERENCES activities_master (activity_id),
    FOREIGN KEY (status_id) REFERENCES status_master (status_id),
    FOREIGN KEY (created_by) REFERENCES users (user_id),
    FOREIGN KEY (modified_by) REFERENCES users (user_id),
    UNIQUE KEY (ttt_id, activity_id)
);
CREATE TABLE IF NOT EXISTS comments (
    comment_id INT NOT NULL AUTO_INCREMENT,
    added_by INT NOT NULL , 
    is_resolved BOOLEAN NOT NULL,
    comment TEXT NOT NULL, 
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_on DATETIME NOT NULL,
    training_plan_id INT NOT NULL ,
    PRIMARY KEY (comment_id),
    FOREIGN KEY (training_plan_id) REFERENCES training_plan(training_plan_id),
    FOREIGN KEY (added_by) REFERENCES users (user_id)
);

ALTER TABLE technologies_master 
ADD COLUMN image BLOB AFTER technology;

ALTER TABLE technologies_master 
ADD COLUMN description TEXT AFTER image;

ALTER TABLE technologies_master 
ADD COLUMN created_by INT NOT NULL AFTER description;

ALTER TABLE technologies_master 
ADD CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(user_id);

ALTER TABLE tech_topics_master
ADD COLUMN Article TEXT AFTER topic;

ALTER TABLE tech_topics_master
ADD COLUMN Youtube TEXT AFTER Article;

ALTER TABLE tech_topics_master
ADD COLUMN Practice TEXT AFTER Youtube;

ALTER TABLE tech_topics_master
ADD COLUMN Assignments TEXT AFTER Practice;


CREATE TABLE courses (
    course_id INT PRIMARY KEY AUTO_INCREMENT,
    course VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE topics (
    topic_id INT PRIMARY KEY AUTO_INCREMENT,
    topic VARCHAR(255) NOT NULL,
    article TEXT,
    youtube VARCHAR(255),
    practice TEXT,
    assignments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    course_id INT,
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

ALTER TABLE topics
ADD COLUMN status TEXT AFTER assignments;