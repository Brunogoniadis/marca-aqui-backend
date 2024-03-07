const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        res.json({ error: false, message: req.body });

    } catch (err) {
        res.json({ error: true, message: err.message });
    }
})

module.exports = router