const express = require('express');
const router = express.Router();

const Cliente = require('../models/cliente');

const Salao = require('../models/salao');

const Servico = require('../models/servico');

const Colaborador = require('../models/colaborador');

router.post('/', async (req, res) => {
    try {


        const { clienteId, salaoId, servicoId, colaboradorId } = req.body

        //RECUPERAR CLIENTE
        const client = await Cliente.findById(clienteId).
            select('nome endereco customerId')

        //RECUPERAR SALAO
        const salao = await Salao.findById(salaoId).select('recipientId');


        //RECUPERAR SERVICO
        const servico = await Servico.findById(servicoId).select
            ('preco titulo comissao');

        //RECUPERAR COLABORADOR
        const colaborador = await Colaborador.findById(colaboradorId).select
            ('recipientId');

        await createPayment(client, salao, servico, colaborador);




    } catch (err) {

        res.json({ error: true, message: err.message })

    }
})

module.exports = router