require('dotenv').config()
const bcrypt = require('bcrypt')
const express = require('express');
const jwt = require('jsonwebtoken')
const constants = require('../constants.js')
const mysql = require('mysql')
const config = require('../config.js')
const Joi = require('joi');
const router = express.Router();

const pool = mysql.createPool({
    connectionLimit : config.DATABASE_CONNECTION_LIMIT,
    multipleStatements: true,
    host            : config.DATABASE_HOST, 
    user            : config.DATABASE_USER,
    password        : config.DATABASE_PASSWORD, 
    database        : config.DATABASE_NAME
});

let refreshTokens = []

const generateAccessToken = user => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}

router.post('/test/register', async (req, res) => {
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

    let exists = true

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
        res.json(data)
    });
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

module.exports = router;