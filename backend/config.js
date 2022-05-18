module.exports = Object.freeze({
    FRONTEND_DOMAIN                 : 'http://localhost:3000',
    DATABASE_HOST                   : "localhost",
    DATABASE_USER                   : "root",
    DATABASE_PASSWORD               : "",
    DATABASE_NAME                   : "mainhub",
    DATABASE_CONNECTION_LIMIT       : 1000,
    BACKEND_PORT                    : 4000,
    RABBIT_MQ_EXCHANGENAME          : "mainhub",
    RABBIT_MQ_ROUTINGKEY_LOGIN      : "service.mainhub.login",
    RABBIT_MQ_ROUTINGKEY_REGISTER   : "service.mainhub.register",
    RABBIT_MQ_ROUTINGKEY_LOGOUT     : "service.mainhub.logout",
    RABBIT_MQ_DOMAIN                : "127.0.0.1",
    RABBIT_MQ_PORT                  : 5672,
    RABBIT_MQ_USER                  : "guest",
    RABBIT_MQ_PASSWORD              : "guest"
});
