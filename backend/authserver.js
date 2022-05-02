require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

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
        const user = { name: req.body.name, password: hashedPassword }
        //Datenbank
        users.push(user)

        res.sendStatus(201).send()
    }catch{
        res.sendStatus(500)
    }
})

app.post('/api/login', async (req, res) => {
    const user = users.find(user => user.username === req.body.username)
    if (user == null) return res.sendStatus(400).send('Invalid username or password')
    try{
        if(await bcrypt.compare(req.body.password, user.password)){
            res.send('Logged in')
        }else{
            res.send('Failed to log in')
        }
    } catch {
        res.status(500).send('Server error')
    }
    console.log(req);
    const username = req.body.username
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
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



