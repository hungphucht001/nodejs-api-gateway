const express = require('express')
const axios = require('axios')

const app = express()

const PORT = 5002

app.get("/fakeapi", (req, res) => {
    res.send('server 02 \n')
})
app.post("/fakeadmin", (req, res) => {
    res.send('admin nha \n')
})
app.listen(PORT, () => {
    axios({
        url: 'http://localhost:5007/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: {
            "apiname": "registrytest",
            "protocol": 'http',
            "host": "localhost",
            "port": PORT,
            "enabled": true
        }
    }).then((response) => {
        console.log(response.data)
    })

    console.log("server running port 5002")
})