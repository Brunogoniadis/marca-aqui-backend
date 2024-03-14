/* cSpell:disable */
const express = require('express');
const router = express.Router();

const Cliente = require('../models/cliente');
const Salao = require('../models/salao');
const Servico = require('../models/servico');
const Colaborador = require('../models/colaborador');
const Agendamento = require('../models/agendamento')
const Horario = require('../models/horario')

const util = require('../util');
const moment = require('moment/moment');

router.post('/', async (req, res) => {
    try {

        const { clienteId, salaoId, servicoId, colaboradorId } = req.body

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

router.post('/filter', async (req, res) => {
    try {

        const { periodo, salaoId } = req.body;


        const agendamento = await Agendamento.find({
            status: 'A',
            salaoId,
            data: {
                $gte: moment(periodo.inicio).startOf('day'),
                $lte: moment(periodo.final).startOf('day')
            }
        }).populate([
            { path: 'servicoId', select: 'titulo duracao' },
            { path: 'colaboradorId', select: 'nome' },
            { path: 'clienteId', select: 'nome' }


        ])

        res.json({ error: true, message: agendamento })


    } catch (err) {

        res.json({ error: true, message: err.message })

    }

})

router.post('/dias-disponiveis', async (req, res) => {
    try {
        const { data, salaoId, servicoId } = req.body;
        const horarios = await Horario.find({ salaoId });
        const servico = await Servico.findById(servicoId).select('duracao');



        let agenda = []
        let lastDay = moment(data)

        const servicoMinutos = util.hourToMinutes(
            moment(servico.duracao).format('HH:mm')
        );

        const servicoDuracao = moment.duration(servicoMinutos, 'minutes');

        const servicoDuracaoSlots = util.sliceMinutes(
            moment(servico.duracao),
            moment(servico.duracao).add(servicoDuracao, 'minutes'),
            util.SLOT_DURATION,

        ).length;

        /* 
        PROCURAR 365 DIAS ATÉ CONTER 7 DIAS DISPONIVEL */

        for (let i = 0; i <= 365 && agenda.length <= 7; i++) {
            const espacosValidos = horarios.filter(horario => {
                const diaSemanaDisponivel = horario.dias.includes(moment(lastDay).day())

                const servicoDisponivel = horario.especialidades.includes(servicoId)


                return diaSemanaDisponivel && servicoDisponivel
            })
            if (espacosValidos.length > 0) {

                let todosHorariosDia = {}

                for (let spaco of espacosValidos) {

                    for (let colaboradorId of spaco.colaboradores) {
                        if (!todosHorariosDia[colaboradorId]) {
                            todosHorariosDia[colaboradorId] = []
                        }
                        todosHorariosDia[colaboradorId] = [


                            ...todosHorariosDia[colaboradorId],
                            ...util.sliceMinutes(
                                util.mergeDateTime(lastDay, spaco.inicio),
                                util.mergeDateTime(lastDay, spaco.fim),
                                util.SLOT_DURATION
                            )
                        ]

                    }
                }


                /* recuperar agendamentos */
                for (let colaboradorId of Object.keys(todosHorariosDia)) {
                    // LER AGENDAMENTOS DAQUELE ESPECIALISTA NAQUELE DIA



                    const agendamentos = await Agendamento.find({
                        colaboradorId,
                        status: 'A',
                        data: {
                            $gte: moment(lastDay).startOf('day'),
                            $lte: moment(lastDay).endOf('day'),
                        },
                    })

                    let horariosOcupado = agendamentos.map((a) => ({
                        inicio: moment(a.data),
                        fim: moment(a.data).add(servicoDuracao, 'minutes'),
                    }));



                    console.log(horariosOcupado)
                }
                agenda.push({ [lastDay.format("YYYY-MM-DD")]: todosHorariosDia });

            }

            lastDay = moment(lastDay).add(1, 'day')
        }


        res.json({
            error: false, servicoMinutos,
            agenda
        })
    } catch (err) {
        res.json({ error: true, message: err.message })
    }
})

module.exports = router
