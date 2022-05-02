require('dotenv').config()
const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const con = mysql.createConnection(
    {host: "localhost", user: 'root', Password: "", database: "mainhub"}
);

app.use(express.json())
app.listen(3000)

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

const posts = [
    {
        username: 'Justin',
        title: 'Richtig toller Post'
    }, {
        username: 'Paddy',
        title: 'I ♥ react'
    }, {
        username: 'Finn',
        title: 'Noch ein toller Post'
    }
]

app.get('/posts', authToken, (req, res) => {
    res.json(posts.filter(post => post.username === req.user.name))
})
