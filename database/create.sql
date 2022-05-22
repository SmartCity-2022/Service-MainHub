CREATE TABLE Buerger(
    id int NOT NULL AUTO_INCREMENT,
    email varchar(64) UNIQUE,
    password varchar(64),
    PRIMARY KEY (id)
);

CREATE TABLE Log(
    id int NOT NULL AUTO_INCREMENT,
    buerger_id int NOT NULL,
    registerDate timestamp DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buerger_id) REFERENCES Buerger(id),
    PRIMARY KEY (id)
);

CREATE TABLE RefreshToken(
    id int NOT NULL AUTO_INCREMENT,
    token varchar(255),
    PRIMARY KEY (id)
);

DELIMITER $$

CREATE TRIGGER LogInsert
AFTER INSERT
ON Buerger FOR EACH ROW
BEGIN
    INSERT INTO Log(buerger_id) 
    SELECT MAX(id) FROM Buerger;
        -- SELECT LAST_INSERT_ID();
END$$    

DELIMITER ;