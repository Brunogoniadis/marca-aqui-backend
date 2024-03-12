/* cSpell:disable */
const express = require('express');
const router = express.Router();

const Cliente = require('../models/cliente');
const Salao = require('../models/salao');
const Servico = require('../models/servico');
const Colaborador = require('../models/colaborador');
const Agendamento = require('../models/agendamento')
const util = require('../util')

router.post('/', async (req, res) => {
    try {

        const { clienteId, salaoId, servicoId, colaboradorId } = req.body

        console.log('req.body', req.body)
        /* VERIFICAR SE HORARIO ESTA DISPOIVEL */

        const existingAgendamento = await Agendamento.findOne({
            clienteId,
            salaoId,
            servicoId,
            colaboradorId
        });

        if (existingAgendamento) {
            return res.status(400).json({ error: true, message: 'Este agendamento já existe.' });
        }


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

        /*         await createPayment(client, salao, servico, colaborador);
         */

        const precoFinal = util.toCents(servico.preco)

        //CRIAR AGENDAMENTO

        const agendamento = await new Agendamento({
            ...req.body,
            comissao: servico.comissao,
            valor: servico.preco,

        }).save()

        res.json({ error: false, agendamento })

    } catch (err) {

        res.json({ error: true, message: err.message })

    }
})

module.exports = router