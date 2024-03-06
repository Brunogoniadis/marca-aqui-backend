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

router.put('/:colaboradorId', async (req, res) => {
    try {
        const { vinculo, vinculoId, especialidades } = req.body;
        const { colaboradorId } = req.params;

        //vinculo
        await SalaoColaborador.findByIdAndUpdate(vinculoId, { status: vinculo })

        //especialidades
        await ColaboradorServico.deleteMany({
            colaboradorId,
        })
        await ColaboradorServico.insertMany(
            especialidades.map(
                (servicoId) => ({
                    servicoId,
                    colaboradorId
                })
            )
        )

        res.json({ error: false });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.delete('/vinculo/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await SalaoColaborador.findByIdAndUpdate(id, { status: 'E' });
        res.json({ error: false });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.post('/filter', async (req, res) => {
    try {

        const colaboradores = await Colaborador.find(req.body.filters)
        res.json({ error: false, message: colaboradores });


    } catch (err) {
        res.json({ error: true, message: err.message });
    }
}
)


router.get('/salao/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;
        let listaColaboradores = []

        const salaoColaboradores = await SalaoColaborador.find({
            salaoId,
            status: { $ne: 'E' }
        }).populate({ path: 'colaboradorId', select: '-senha' })
            .select('colaboradorId dataCadastro status')

        for (let vinculo of salaoColaboradores) {
            const especialidades = await ColaboradorServico.find({
                colaboradorId: vinculo.colaboradorId._id,
            })

            listaColaboradores.push({
                ...vinculo._doc,
                especialidades,
            });
        }
        res.json({
            error: false,
            colaboradores: listaColaboradores.map((vinculo) => ({
                ...vinculo.colaboradorId._doc,
                vinculoId: vinculo._id,
                vinculo: vinculo.status,
                especialidades: vinculo.especialidades,
                dataCadastro: vinculo.dataCadastro
            }))
        });

    } catch (err) {
        res.json({ error: true, message: err.message });
    }
})

module.exports = router