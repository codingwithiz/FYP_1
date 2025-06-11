IF DB_ID('MyAppDB') IS NULL
    CREATE DATABASE MyAppDB;
GO
USE MyAppDB;
GO
CREATE TABLE Users (
    userId VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    preferenceId VARCHAR(50)
);


CREATE TABLE Preferences (
    preferenceId VARCHAR(50) PRIMARY KEY,
    default_prompt TEXT,
    theme VARCHAR(50)
);


CREATE TABLE ReferencePoint (
    pointId VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    lat FLOAT,
    lon FLOAT
);


CREATE TABLE Analysis (
    analysisId VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50),
    referencePointId VARCHAR(50),
    chatId VARCHAR(50),
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (referencePointId) REFERENCES ReferencePoint(pointId)
);


CREATE TABLE RecommendedLocation (
    locationId VARCHAR(50) PRIMARY KEY,
    analysisId VARCHAR(50),
    lat FLOAT,
    lon FLOAT,
    score FLOAT,
    reason TEXT,
    FOREIGN KEY (analysisId) REFERENCES Analysis(analysisId)
);


CREATE TABLE Chat (
    chatId VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    thread_id VARCHAR(255),
    userId VARCHAR(50),
    analysisId VARCHAR(50),
    FOREIGN KEY (userId) REFERENCES Users(userId),
    FOREIGN KEY (analysisId) REFERENCES Analysis(analysisId)
);


CREATE TABLE Conversation (
    conversationId VARCHAR(50) PRIMARY KEY,
    chatId VARCHAR(50),
    user_prompt TEXT,
    bot_answer TEXT,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (chatId) REFERENCES Chat(chatId)
);

