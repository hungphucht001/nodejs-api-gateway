const express = require('express')
const router = require('./router')
const helmet = require("helmet");
const registry = require('./router/registry.json')

const app = express()
const PORT = 5007

app.use(helmet());
app.use(express.json())

const auth = (req, res, next) => {
    const url = req.body.protocol + "://" + req.body.host + PORT + req.body.path
    const autString = Buffer.from(req.headers.authorization, 'base64').toString('utf-8')
    const authParts = autString.split(':')

    const username = authParts[0]
    const password = authParts[1]

    const user = registry.auth.users[username]
    if (user) {
        if (user.username === username && user.password === password) {
            next();
        }
        else {
            res.send({ authenticated: false, path: url, message: "Authentication Unsucceefull : Incorrect password" })
        }
    }
    else {
        res.send({ authenticated: false, path: url, message: "Authentication Unsucceefull : User " + username + ' does not exist.' })
    }
}

app.use(auth)
app.use("/", router)

app.listen(PORT, () => {
    console.log("server running port 5000")
})