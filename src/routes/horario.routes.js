/* cSpell:disable */
const express = require('express');
const router = express.Router();
const horario = require('../models/horario');
const Horario = require('../models/horario');

router.post('/', async (req, res) => {
    try {
        const horario = await new Horario(req.body).save()
        res.json({ horario })
    } catch (error) {
        res.json({ error: true, message: err.message })
    }
})
module.exports = router