require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const mysql = require('mysql')
const bcrypt = require('bcrypt')
const con = mysql.createConnection(
    {host: "localhost", user: 'root', Password: "", database: "mainhub"}
);

app.use(express.json())
app.listen(4000)

let refreshTokens = []
const users = []

const generateAccessToken = user => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/api/register', async (req, res) => {
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const values = [
            req.body.name,
            req.body.forename,
            req.body.email,
            req.body.password = hashedPassword,
            req.body.city,
            req.body.postalCode,
            req.body.street,
            req.body.telefonNumber
        ];
        
        const sql = "INSERT INTO `buerger` (name, vorname, email, passwort, stadt, postleitzahl, strasse, telefon) VALUES (?,?,?,?,?,?,?,?);";
        con.query(sql, values, function (err, result) {
            if (err) throw err;
            res.send(result);
        });
    }catch{
        res.sendStatus(500)
    }
})

app.post('/api/login', async (req, res) => {
    const user = "SELECT buerger.passwort FROM buerger WHERE buerger.email = '" + req.body.email + "'";
    let userResult
    con.query(user, async function (err, result) {
        if (err) throw err
        if (result.length === 0) 
        return res.sendStatus(400).send('Invalid email or password')
        userResult = result[0]
        try{
            if(await bcrypt.compare(req.body.password, userResult.passwort)){
                const email = { email: req.body.email }
                const accessToken = generateAccessToken(email)
                const refreshToken = jwt.sign(email, process.env.REFRESH_TOKEN_SECRET)
                refreshTokens.push(refreshToken)
                console.log("in here")
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



