const express = require('express')
const router = express.Router()
const axios = require('axios')
const registry = require('./registry.json')
const fs = require('fs')
const loadbalancer = require('../../util/loadbalance')

const auth = (req, res, next) => {
    const url = req.body.protocol + "://" + req.body.host + 5000 + req.body.path
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
router.post('/enable/:apiname', (req, res) => {
    const apiName = req.params.apiname
    const reqBody = req.body
    const instances = registry.services[apiName].instances
    const index = instances.findIndex((srv) => srv.url === reqBody.url)
    if (index == -1) {
        res.send({ status: 'error', message: "Cloun not find " + reqBody.url + " for service" + apiName })
    }
    else {
        instances[index].enabled = reqBody.enabled
        fs.writeFile('./server/router/registry.json', JSON.stringify(registry), (err) => {
            if (err) {
                res.send('Cloud not enable/disable:' + reqBody.url + " for service " + apiName + "\n" + err)
            }
            else {
                res.send('Successfully enable/disable: ' + reqBody.url + " for service " + apiName + "\n")
            }
        })
    }
})

router.all('/:apiName/:path', (req, res) => {

    const service = registry.services[req.params.apiName]

    if (service) {
        if (!service.loadBalanceStratery) {
            service.loadBalanceStratery = "ROUND_ROBIN"
            fs.writeFile('./server/router/registry.json', JSON.stringify(registry), (err) => {
                if (err) {
                    res.send("Cloudn't write load balance strategy" + err)
                }
            })
        }
        const newIndex = loadbalancer[service.loadBalanceStratery](service)
        const url = service.instances[newIndex].url
        axios({
            url: url + req.params.path,
            method: req.method,
            // headers: req.headers,
            data: req.body
        }).then((response) => {
            res.send(response.data)
        }).catch(err => {
            res.send(err)
        })
    }
    else res.send("API name dosen't exist")
})

router.post('/register', (req, res) => {
    const registrationInfo = req.body
    registrationInfo.url = registrationInfo.protocol + '://' + registrationInfo.host + ":" + registrationInfo.port + "/"

    if (apiAlreadyExists(registrationInfo)) {
        res.send("Configutation already exists for: " + registrationInfo.apiname + " at " + registrationInfo.url)
    }

    else {
        registry.services[registrationInfo.apiname].instances.push({ ...registrationInfo })
        fs.writeFile('./server/router/registry.json', JSON.stringify(registry), (err) => {
            if (err) {
                res.send('Cloud not register:' + registrationInfo.apiname + "\n" + err)
            }
            else {
                res.send('Successfully registered: ' + registrationInfo.apiname + "\n")
            }
        })
    }
})

router.post('/unregister', (req, res) => {
    const registrationInfo = req.body
    registrationInfo.url = registrationInfo.protocol + '://' + registrationInfo.host + ":" + registrationInfo.port + "/"

    if (apiAlreadyExists(registrationInfo)) {
        const index = registry.services[registrationInfo.apiname].instances.findIndex((instance) => {
            return registrationInfo.url === instance.url
        })

        registry.services[registrationInfo.apiname].splice(index, 1)
        fs.writeFile('./server/router/registry.json', JSON.stringify(registry), (err) => {
            if (err) {
                res.send('Cloud not unregister:' + registrationInfo.apiname + "\n" + err)
            }
            else {
                res.send('Successfully unregistered: ' + registrationInfo.apiname + "\n")
            }
        })
    }
    else {
        res.send("Configutation dose not exists for: " + registrationInfo.apiname + " at " + registrationInfo.url)
    }
})

const apiAlreadyExists = (registrationInfo) => {
    let exists = false

    registry.services[registrationInfo.apiname].instances.forEach(instance => {
        if (instance.url === registrationInfo.url) {
            exists = true
            return
        }
    });

    return exists
}

module.exports = router