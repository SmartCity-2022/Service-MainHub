require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const amqp = require("amqplib/callback_api");
const constants = require('./constants.js')
const config = require('./config.js')
const axios = require('axios');
const Joi = require('joi');
const routerTesting = require('./routes/testing.js')

var cors = require('cors');

app.use(express.json())
app.use(routerTesting)
let amqpConn
let amqpChannel

app.use(cors({
    origin: config.FRONTEND_DOMAIN
}));

const pool = mysql.createPool({
    connectionLimit : config.DATABASE_CONNECTION_LIMIT,
    multipleStatements: true,
    host            : config.DATABASE_HOST, 
    user            : config.DATABASE_USER,
    password        : config.DATABASE_PASSWORD, 
    database        : config.DATABASE_NAME
});

const generateAccessToken = user => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '120m' })
}

app.post('/api/register', async (req, res) => { 
    try {
        const error = await validateSchema.validateAsync(req.body);
    }
    catch (err) { 
        if (err.details[0].type == 'string.pattern.base')
            return res.status(400).send({errMsg: constants.ERR_INVALID_EMAIL_VALIDATION_FAILED}); 
        if (err.details[0].type == 'string.min')
            return res.status(400).send({errMsg: constants.ERR_INVALID_PASSWORD_MIN_LENGTH}); 
        if (err.details[0].type == 'string.max')
            return res.status(400).send({errMsg: constants.ERR_INVALID_PASSWORD_MAX_LENGTH});
    }

    if (req.body.password != req.body.password2)
        return res.status(400).send({errMsg: constants.ERR_INVALID_PASSWORD_MATCH});

    let exists = false
    try {
        await axios
            .post(config.CITIZEN_PORTAL_API_EMAIL_EXISTS, {
                email: req.body.email,
            })
            .then(resp => {
                if(resp.data.exists) 
                    exists = true
            })
    } catch (error) {
        console.log(error)
    }

    if(!exists)
        return res.status(400).send({errMsg: "Sie m??ssen sich erst als B??rger im B??rgeramt melden!"});

    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const values = [
        req.body.email,
        req.body.password = hashedPassword
    ];
    const sql = "INSERT INTO `Buerger` (email, password) VALUES (?,?);";
    pool.query(sql, values, function (err, result) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY')
                return res.status(400).send({errMsg: constants.ERR_DUPLICATE_ENTRY});
            return res.status(500).send({msg: err});
        }

        const accessToken = getAccessToken(req.body.email)
        const refreshToken = getRefreshToken(req.body.email)
        const data = { accessToken: accessToken, refreshToken: refreshToken };

        try {
        amqpChannel.publish(config.RABBIT_MQ_EXCHANGENAME, config.RABBIT_MQ_ROUTINGKEY_REGISTER, Buffer.from(JSON.stringify(data))); 
        } catch (error) {
            console.log(error)
        }
        res.json(data)
    });
})

app.post('/api/login', async (req, res) => {
    const values = [
        req.body.email
    ];
    const sql = "SELECT Buerger.password, Buerger.email FROM Buerger WHERE Buerger.email = ?";
    let userResult
    pool.query(sql, values, async function (err, result) {
        if (err) {
            return res.status(500).send('Server Error on Login');
        }
        if (result.length === 0) 
        return res.status(400).send({errMsg: constants.ERR_INVALID_EMAIL_PASSWORD})
        userResult = result[0]
        try{
            if(await bcrypt.compare(req.body.password, userResult.password)){
                const accessToken = getAccessToken(userResult.email)
                const refreshToken = getRefreshToken(userResult.email)
                const data = { accessToken: accessToken, refreshToken: refreshToken };
                try {
                    amqpChannel.publish(config.RABBIT_MQ_EXCHANGENAME, config.RABBIT_MQ_ROUTINGKEY_LOGIN, Buffer.from(JSON.stringify(data))); 
                } catch (error) {
                    console.log(error)
                }
                
                res.json(data)
            }else{
                res.status(400).send({errMsg: constants.ERR_INVALID_PASSWORD})
            }
        } catch {
            res.status(500).send('Server error')
        }

    });
})

app.delete('/api/deleteuser', (req, res) => {
    const values = [
        req.body.email,
        req.body.email
    ];
    const sql = `DELETE FROM UserLog WHERE buerger_id = (SELECT Buerger.id FROM Buerger WHERE Buerger.email = ?); DELETE FROM Buerger WHERE Buerger.email = ?;`;
    pool.query(sql, values, function (err, result) {
        if (err) return res.status(500).send({errMsg: 'Unerwarteter Server Error!'});
        const data = { msg: 'User deleted' };
        res.json(data).status(204)
    })
})

app.delete('/api/logout', (req, res) => {
    const values = [
        req.body.token
    ];
    const sql = "DELETE FROM RefreshToken WHERE token = ?";
    pool.query(sql, values, function (err, result) {
        if (err) return res.status(500).send({errMsg: 'Unerwarteter Server Error!'});
        if (result.affectedRows === 0) {
            return res.status(500).send({errMsg: 'Unerwarteter Server Error!'});
        }
        const data = {msg: "logout"};
        try {
        amqpChannel.publish(config.RABBIT_MQ_EXCHANGENAME, config.RABBIT_MQ_ROUTINGKEY_LOGOUT, Buffer.from(JSON.stringify(data))); 
        } catch (error) {
            console.log(error)
        }
        res.json(data).status(204)
    })
})

app.post('/api/token', (req, res) => {
    const refreshToken = req.body.token
    if(refreshToken == null) return res.status(401).send({errMsg:  constants.ERR_MISSING_TOKEN})
    const values = [ refreshToken ]

    const sql = "SELECT * FROM RefreshToken WHERE token = ?";
    pool.query(sql, values, function (err, result) {
        if (err) {
            return res.status(500).send({errMsg: 'Unerwarteter Server Error!'});
        }
        if (result.length <= 0)
            return res.status(403).send({errMsg: constants.ERR_INVALID_TOKEN});

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, email) => {
            if(err) return res.status(403).send({errMsg: constants.ERR_INVALID_TOKEN})
            const accessToken = generateAccessToken({ email })
            return res.json({ accessToken: accessToken })
        })
    })
})

function getAccessToken(userEmail) {
    const email = { email: userEmail }
    const accessToken = generateAccessToken(email)
    return accessToken
}

function getRefreshToken(userEmail) {
    const refreshToken = jwt.sign(userEmail, process.env.REFRESH_TOKEN_SECRET)
    const values = [
        refreshToken
    ];
    const sql = "INSERT INTO RefreshToken (token) VALUES (?);";
    pool.query(sql, values, function (err, result) {
        if(err) console.log(err)
    })
    return refreshToken
}

const validateSchema = Joi.object({
    email: Joi.string()
        .min(3)
        .required()
        .pattern(new RegExp('.@.+\..')),

    password: Joi.string()
        .min(8)
        .pattern(new RegExp('.{8,30}$')),

    password2: Joi.ref('password'),
})


amqp.connect(`amqp://${config.RABBIT_MQ_USER}:${config.RABBIT_MQ_PASSWORD}@${config.RABBIT_MQ_DOMAIN}:${config.RABBIT_MQ_PORT}`, function(error0, connection) {
    if(error0) {
        console.log(error0)
        return}
    amqpConn = connection 

    connection.createChannel(function(error1, channel) { 
        if(error1) {
            console.log(error1)
            return}
        channel.assertExchange(config.RABBIT_MQ_EXCHANGENAME, "topic", {durable: true}); 
        amqpChannel = channel 

        channel.assertQueue("", { exclusive: true }, (error2, queueInstance) => {
            if(error2) {console.log(error2)
                return};

            channel.bindQueue(queueInstance.queue, config.RABBIT_MQ_EXCHANGENAME, config.RABBIT_MQ_ROUTINGKEY_HELLO);

            channel.consume(queueInstance.queue, function(msg) {
                if(msg.fields.routingKey == config.RABBIT_MQ_ROUTINGKEY_HELLO) {
                    channel.publish(config.RABBIT_MQ_EXCHANGENAME, config.RABBIT_MQ_ROUTINGKEY_WORLD, Buffer.from(process.env.ACCESS_TOKEN_SECRET)); 
                }
            }, { noAck: true });
        });
    });
});

process.on("SIGINT", () => {
    if(amqpConn) amqpConn.close();
    process.exit(0);
});

module.exports = app;