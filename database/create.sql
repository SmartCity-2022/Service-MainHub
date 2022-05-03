CREATE TABLE Buerger(
    id int NOT NULL AUTO_INCREMENT,
    name varchar(64),
    vorname varchar(64),
    email varchar(64) UNIQUE,
    passwort varchar(64),
    stadt varchar(64),
    postleitzahl int(5),
    strasse varchar(128),
    telefon varchar(64),
	registrierungZeit timestamp DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE Log(
    id int NOT NULL AUTO_INCREMENT,
    buerger_id int NOT NULL,
    loginZeit timestamp DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buerger_id) REFERENCES Buerger(id),
    PRIMARY KEY (id)
);

CREATE TABLE AccessToken(
    id int NOT NULL AUTO_INCREMENT,
    Token varchar(255),
    PRIMARY KEY (id)
);
