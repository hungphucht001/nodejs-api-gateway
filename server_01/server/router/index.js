const express = require('express')
const router = express.Router()

router.all('/:apiName', (req, res) => {
    res.send(req.params.apiName + "\n")
})

module.exports = router