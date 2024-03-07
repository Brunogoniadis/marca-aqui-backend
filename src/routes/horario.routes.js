/* cSpell:disable */
const express = require('express');
const router = express.Router();
const Horario = require('../models/horario');
const ColaboradorServico = require('../models/relationship/colaboradorSevico')
const _ = require("lodash")
router.post('/', async (req, res) => {
    try {
        const horario = await new Horario(req.body).save()
        res.json({ horario })
    } catch (error) {
        res.json({ error: true, message: err.message })
    }
})


router.get('/salao/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;

        const horarios = await Horario.find({
            salaoId,
        });

        res.json({ error: false, horarios });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.put('/:horarioId', async (req, res) => {
    try {
        const { horarioId } = req.params;
        const horario = req.body
        await Horario.findByIdAndUpdate(horarioId, horario)
        res.json({ error: false });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.post('/colaboradores', async (req, res) => {
    try {
        const colaboradorServico = await ColaboradorServico.find({
            servicoId: { $in: req.body.especialidades },
            status: 'A'
        }).populate('colaboradorId', 'nome').select('colaboradorId -_id');

        const listaColaboradores =
            _.uniqBy(colaboradorServico, (vinculo) =>
                vinculo.colaboradorId._id.toString()
            ).map(vinculo => ({
                label: vinculo.colaboradorId.nome,
                value: vinculo.colaboradorId._id
            }));

        res.json({ error: false, listaColaboradores })
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
})

router.delete(':/horarioId', async (req, res) => {
    try {
        const { horarioId } = req.params
        await Horario.findByIdAndDelete(horarioId)
        res.json({ error: false });
    }
    catch (err) {
        res.json({ error: true, message: err.message });
    }
})


module.exports = router