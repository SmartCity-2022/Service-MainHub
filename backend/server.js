require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const HttpStatus = require('http-status');
const amqp = require("amqplib/callback_api");

app.use(express.json())
app.listen(4000)

let amqpConn
let amqpChannel


app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const pool = mysql.createPool({
    connectionLimit: 1000,
    host: "localhost", 
    user: 'root', Password: "", 
    database: "mainhub"}
);

let refreshTokens = []
const users = []

const generateAccessToken = user => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

app.get('/users', async (req, res) => {
    try {
        res.json(users)
    } 
    catch (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message }); // 500
    }
})

app.post('/api/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const values = [
        req.body.email,
        req.body.password = hashedPassword
    ];
    const sql = "INSERT INTO `buerger` (email, password) VALUES (?,?);";
    pool.query(sql, values, function (err, result) {
        if (err) return res.status(500).send({msg: err});
        const accessToken = getAccessToken(req.body.email)
        const refreshToken = getRefreshToken(req.body.email)
        const data = { accessToken: accessToken, refreshToken: refreshToken };
        amqpChannel.publish("mainhub", "service.mainhub.register", Buffer.from(JSON.stringify(data))); 
        res.json(data)
    });
})

app.post('/api/login', async (req, res) => {
    const user = "SELECT buerger.password, buerger.email FROM buerger WHERE buerger.email = '" + req.body.email + "'";
    let userResult
    pool.query(user, async function (err, result) {
        if (err) return res.status(500).send('Error on Login');
        if (result.length === 0) 
        return res.status(400).send('Invalid email or password')
        userResult = result[0]
        try{
            if(await bcrypt.compare(req.body.password, userResult.password)){
                const accessToken = getAccessToken(userResult.email)
                const refreshToken = getRefreshToken(userResult.email)
                const data = { accessToken: accessToken, refreshToken: refreshToken };
                amqpChannel.publish("mainhub", "service.mainhub.login", Buffer.from(JSON.stringify(data))); 
                res.json(data)
            }else{
                res.send('Failed to log in')
            }
        } catch {
            res.status(500).send('Server error')
        }

    });
})

app.delete('/api/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token != req.body.token)
    const sql = "DELETE FROM accesstoken WHERE token = '" + req.body.token + "';";
    pool.query(sql, function (err, result) {
        if (err) return res.status(500).send('Error on Delete');
        if (result.affectedRows === 0) {
            console.log("No token found")
        }
        const data = {msg: "logout"};
        amqpChannel.publish("mainhub", "service.mainhub.register", Buffer.from(JSON.stringify(data))); 
        res.json(data)
    })
    res.sendStatus(204)
})

app.post('/api/token', (req, res) => {
    const refreshToken = req.body.token
    if(refreshToken == null) return res.sendStatus(401)
    if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
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
    const sql = "INSERT INTO accesstoken (token) VALUES ('" + refreshToken + "');";
    pool.query(sql, function (err, result) {
        if (err) throw err;
        if(result.length === 0) 
        return res.sendStatus(500).send('Error on RefreshToken')
    })
    return refreshToken
}

const authToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if(token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

amqp.connect("amqp://guest:guest@127.0.0.1:5672", function(error0, connection) {
    if(error0) throw error0;
    amqpConn = connection 

    connection.createChannel(function(error1, channel) { 
        if(error1) throw error1;
        channel.assertExchange("mainhub", "topic", {durable: false}); 
        amqpChannel = channel 
    });
});

process.on("SIGINT", () => {
    if(amqpConn) amqpConn.close();
    process.exit(0);
});