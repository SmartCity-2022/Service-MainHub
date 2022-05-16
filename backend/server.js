require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const mysql = require('mysql')
const bcrypt = require('bcrypt')

app.use(express.json())
app.listen(4000)
const HttpStatus = require('http-status');

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
    const sql = "INSERT INTO `buerger` (email, passwort) VALUES (?,?);";
    pool.query(sql, values, function (err, result) {
        if (err) return res.status(500).send('Error on Register');
        const accessToken = getAccessToken(req.body.email)
        const refreshToken = getRefreshToken(req.body.email)
        res.json({ accessToken: accessToken, refreshToken: refreshToken })
    });
})

app.post('/api/login', async (req, res) => {
    const user = "SELECT buerger.passwort, buerger.email FROM buerger WHERE buerger.email = '" + req.body.email + "'";
    let userResult
    pool.query(user, async function (err, result) {
        if (err) return res.status(500).send('Error on Login');
        if (result.length === 0) 
        return res.status(400).send('Invalid email or password')
        userResult = result[0]
        try{
            if(await bcrypt.compare(req.body.password, userResult.passwort)){
                const accessToken = getAccessToken(userResult.email)
                const refreshToken = getRefreshToken(userResult.email)
                res.json({ accessToken: accessToken, refreshToken: refreshToken })
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

// const posts = [
//     {
//         username: 'Justin',
//         title: 'Richtig toller Post'
//     }, {
//         username: 'Paddy',
//         title: 'I ♥ react'
//     }, {
//         username: 'Finn',
//         title: 'Noch ein toller Post'
//     }
// ]

// app.get('/posts', authToken, (req, res) => {
//     res.json(posts.filter(post => post.username === req.user.name))
// })