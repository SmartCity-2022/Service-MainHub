CREATE TABLE Buerger(
    id int NOT NULL AUTO_INCREMENT,
    email varchar(64) UNIQUE,
    password varchar(64),
    PRIMARY KEY (id)
);

CREATE TABLE Log(
    id int NOT NULL AUTO_INCREMENT,
    buerger_id int NOT NULL,
    loginDate timestamp DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buerger_id) REFERENCES Buerger(id),
    PRIMARY KEY (id)
);

CREATE TABLE RefreshToken(
    id int NOT NULL AUTO_INCREMENT,
    Token varchar(255),
    PRIMARY KEY (id)
);
