/* cSpell:disable */
const express = require('express');
const router = express.Router();
const Colaborador = require('../models/colaborador')
const SalaoColaborador = require('../models/relationship/salaoColaborador')
const ColaboradorServico = require('../models/relationship/colaboradorSevico')

router.post('/', async (req, res) => {
    try {
        const { colaborador, salaoId } = req.body
        let newColaborador = null

        // Verificar se o colaborador existe
        const existentColaborador = await Colaborador.findOne({
            $or: [
                { email: colaborador.email },
                { telefone: colaborador.telefone }
            ]
        })

        if (!existentColaborador) {
            newColaborador = new Colaborador({ ...colaborador })
            await newColaborador.save()
        }

        // Obter o ID do colaborador
        const colaboradorId = existentColaborador
            ? existentColaborador._id
            : newColaborador._id

        // Verificar se o relacionamento já existe
        const existentRelationship = await SalaoColaborador.findOne({
            salaoId,
            colaboradorId,
            status: { $ne: 'E' }
        })

        // Se não houver vínculo, criar um novo relacionamento
        if (!existentRelationship) {
            const newRelationship = new SalaoColaborador({
                salaoId,
                colaboradorId,
                status: colaborador.vinculo
            })
            await newRelationship.save()
        } else {
            // Se o relacionamento já existir, atualizar o status
            existentRelationship.status = colaborador.vinculo
            await existentRelationship.save()
        }

        // Relacionar as especialidades do colaborador
        await ColaboradorServico.insertMany(
            colaborador.especialidades.map(servicoId => ({
                servicoId,
                colaboradorId
            }))
        )

        // Verificar se o colaborador e o relacionamento já existem
        if (existentColaborador && existentRelationship) {
            return res.json({ error: true, message: 'Colaborador já cadastrado.' });
        } else {
            return res.json({ error: false })
        }
    } catch (error) {
        return res.json({ error: true, message: error.message })
    }
})

module.exports = router