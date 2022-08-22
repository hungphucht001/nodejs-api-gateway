const express = require('express')
const axios = require('axios')
const app = express()
const PORT = 5001

app.get("/fakeapi", (req, res) => {
    res.send('server 01 \n')
})
app.post("/fakeadmin", (req, res) => {
    res.send('admin nha \n')

})
app.listen(PORT, () => {
    const authString = 'john:123'
    const encodeAuthString = Buffer.from(authString, 'utf-8').toString('base64')
    console.log(encodeAuthString)
    axios({
        url: 'http://localhost:5007/register',
        method: 'POST',
        headers: {
            'authorization': encodeAuthString,
            'Content-Type': 'application/json'
        },
        data: {
            "apiname": "registrytest",
            "protocol": 'http',
            "host": "localhost",
            "port": PORT,
            "enabled": true
        }
    }).then((response) => {
        console.log(response.data)
    }).catch(err => {
        console.log(err)
    })

    console.log("server running port 5002")
})