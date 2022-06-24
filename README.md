# Service-MainHub
Der Mainhub dient als zentrale Anlaufstelle für alle Services. Man kann sich über den Mainhub registrieren, einloggen und auf sämtliche Services über eine Navigationsbar zugreifen,
wodurch diese als als Microservice in den Mainhub eingebunden werden.

## Installation
- Backend: `npm install`
- Frontend: `npm install`
- Datenbank: Ausführung des `create.sql` Scripts

## Ausführung
- Backend: `node server.js`
- Frontend: `npm start`

## Konfiguration
### Backend
|Variable|Beschreibung|
|---|---|
|FRONTEND_DOMAIN|URL des Frontends|
|DATABASE_HOST|Hostname oder IP des MySQL Servers|                 
|DATABASE_USER|Name des Datenbanknutzers| 
|DATABASE_PASSWORD|Passwort des Datenbanknutzers|
|DATABASE_NAME|Name der Datenbank|
|DATABASE_CONNECTION_LIMIT|Maximale Anzahl von Datenbankverbindungen|
|BACKEND_PORT|Port für das Backend|
|RABBIT_MQ_EXCHANGENAME|Name des RabbitMQ Exchanges|
|RABBIT_MQ_ROUTINGKEY_LOGIN|RabbitMQ Routing-Key für einen Benutzerlogin|
|RABBIT_MQ_ROUTINGKEY_REGISTER|RabbitMQ Routing-Key für eine Registrierung|
|RABBIT_MQ_ROUTINGKEY_LOGOUT|RabbitMQ Routing-Key für einen Logout|
|RABBIT_MQ_ROUTINGKEY_HELLO|RabbitMQ Routing-Key um auf neu gestartete Services zu reagieren|
|RABBIT_MQ_ROUTINGKEY_WORLD|RabbitMQ Routing-Key um neu gestarteten Servives zu antworten|
|RABBIT_MQ_DOMAIN|URL des RabbitMQ Servers|
|RABBIT_MQ_PORT|Port des RabbitMQ Servers|
|RABBIT_MQ_USER|Benutzername für den RabbitMQ Server|
|RABBIT_MQ_PASSWORD|Passwort für den RabbitMQ Benutzer|
|CITIZEN_PORTAL_API_EMAIL_EXISTS|API-Endpoint des Bürgerbüros, um Emails zu validieren|
### Frontend
#### Allgemein
|Variable|Beschreibung|
|---|---|
|domain|URL des Mainhub Backends|
#### Services
|Servicename|URL|
|---|---|
|Bank|https://bank.smartcity.w-mi.de|
|Bauamt|https://bauamt.smartcity.w-mi.de|
|Bildungsportal|https://bildung.smartcity.w-mi.de|
|Bürgerbüro|https://buergerbuero.smartcity.w-mi.de|
|Gesundheitsportal|https://gesundheit.smartcity.w-mi.de|
|Immobilienportal||
|Jobportal|https://jobs.smartcity.w-mi.de|
|Kulturportal||
|Mobilitätshub||
|Polizei||
|Straßenverkehrsamt|https://strassenverkehrsamt.smartcity.w-mi.de|