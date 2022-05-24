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
var cors = require('cors');

app.use(express.json())
app.listen(config.BACKEND_PORT)

let amqpConn
let amqpChannel

app.use(cors({
    origin: config.FRONTEND_DOMAIN
}));

const pool = mysql.createPool({
    connectionLimit : config.DATABASE_CONNECTION_LIMIT,
    host            : config.DATABASE_HOST, 
    user            : config.DATABASE_USER,
    password        : config.DATABASE_PASSWORD, 
    database        : config.DATABASE_NAME
});

let refreshTokens = []

const generateAccessToken = user => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

app.post('/api/register', async (req, res) => {

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
            return res.status(400).send({errMsg: "Sie müssen sich erst als Bürger im Bürgeramt melden!"});

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

        amqpChannel.publish(config.RABBIT_MQ_EXCHANGENAME, config.RABBIT_MQ_ROUTINGKEY_REGISTER, Buffer.from(JSON.stringify(data))); 
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
            return res.status(500).send('Server Eror on Login');
        }
        if (result.length === 0) 
        return res.status(400).send({errMsg: constants.ERR_INVALID_EMAIL_PASSWORD})
        userResult = result[0]
        try{
            if(await bcrypt.compare(req.body.password, userResult.password)){
                const accessToken = getAccessToken(userResult.email)
                const refreshToken = getRefreshToken(userResult.email)
                const data = { accessToken: accessToken, refreshToken: refreshToken };
                amqpChannel.publish(config.RABBIT_MQ_EXCHANGENAME, config.RABBIT_MQ_ROUTINGKEY_LOGIN, Buffer.from(JSON.stringify(data))); 
                res.json(data)
            }else{
                res.status(400).send({errMsg: constants.ERR_INVALID_PASSWORD})
            }
        } catch {
            res.status(500).send('Server error')
        }

    });
})

app.delete('/api/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token != req.body.token)
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
        amqpChannel.publish(config.RABBIT_MQ_EXCHANGENAME, config.RABBIT_MQ_ROUTINGKEY_LOGOUT, Buffer.from(JSON.stringify(data))); 
        res.json(data).status(204)
    })
})

app.post('/api/token', (req, res) => {
    const refreshToken = req.body.token
    if(refreshToken == null) return res.status(401).send({errMsg:  constants.ERR_MISSING_TOKEN})
    if(!refreshTokens.includes(refreshToken)) return res.status(403).send({errMsg: constants.ERR_INVALID_TOKEN})
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.status(403).send({errMsg: constants.ERR_INVALID_TOKEN})
        const accessToken = generateAccessToken({ name: user.name })
        return res.json({ accessToken: accessToken })
    })
})

function getAccessToken(userEmail) {
    const email = { email: userEmail }
    const accessToken = generateAccessToken(email)
    return accessToken
}

function getRefreshToken(userEmail) {
    const refreshToken = jwt.sign(userEmail, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    const values = [
        refreshToken
    ];
    const sql = "INSERT INTO RefreshToken (token) VALUES (?);";
    pool.query(sql, values, function (err, result) {
        if(err) console.log(err)
    })
    return refreshToken
}

/*const authToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    })
}*/


amqp.connect(`amqp://${config.RABBIT_MQ_USER}:${config.RABBIT_MQ_PASSWORD}@${config.RABBIT_MQ_DOMAIN}:${config.RABBIT_MQ_PORT}`, function(error0, connection) {
    if(error0) throw error0;
    amqpConn = connection 

    connection.createChannel(function(error1, channel) { 
        if(error1) throw error1;
        channel.assertExchange(config.RABBIT_MQ_EXCHANGENAME, "topic", {durable: true}); 
        amqpChannel = channel 

        channel.assertQueue("", { exclusive: true }, (error2, queueInstance) => {
            if(error2) throw error2;

            channel.bindQueue(queueInstance.queue, config.RABBIT_MQ_EXCHANGENAME, config.RABBIT_MQ_ROUTINGKEY_HELLO);

            channel.consume(queueInstance.queue, function(msg) {
                if(msg.fields.routingKey == config.RABBIT_MQ_ROUTINGKEY_HELLO) {
                    channel.publish(config.RABBIT_MQ_EXCHANGENAME, config.RABBIT_MQ_ROUTINGKEY_WORLD, Buffer.from(JSON.stringify(process.env.ACCESS_TOKEN_SECRET))); 
                }
            }, { noAck: true });
        });
    });
});

process.on("SIGINT", () => {
    if(amqpConn) amqpConn.close();
    process.exit(0);
});