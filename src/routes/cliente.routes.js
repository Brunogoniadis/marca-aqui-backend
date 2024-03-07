const express = require('express');
const router = express.Router();
const Cliente = require('../models/cliente');
const SalaoCliente = require('../models/relationship/salaoCliente')


router.post('/', async (req, res) => {
    try {
        const { cliente, salaoId } = req.body;

        const existentClient = await Cliente.findOne({
            $or: [
                { email: cliente.email },
                { telefone: cliente.telefone },
            ],
        });

        let newClient = null;


        if (!existentClient) {

            newClient = await new Cliente({
                ...cliente
            }).save();
        }

        const clienteId = existentClient ? existentClient._id : newClient._id;

        const existentRelationship = await SalaoCliente.findOne({
            salaoId,
            clienteId,
        });

        if (!existentRelationship) {
            await new SalaoCliente({
                salaoId,
                clienteId,
            }).save();
        }

        if (existentRelationship && existentRelationship.status === 'I') {
            await SalaoCliente.findOneAndUpdate(
                {
                    salaoId,
                    clienteId,
                },
                { status: 'A' }
            );
        }

        if (
            existentRelationship &&
            existentRelationship.status === 'A' &&
            existentClient
        ) {
            res.json({ error: true, message: 'Cliente já cadastrado!' });
        } else {
            res.json({ error: false });
        }
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.post('/filter', async (req, res) => {
    try {

        const clientes = await Cliente.find(req.body.filters);
        res.json({ error: false, message: clientes });


    } catch (err) {
        res.json({ error: true, message: err.message });
    }
}
)

router.get('/salao/:salaoId', async (req, res) => {
    try {
        const clientes = await SalaoCliente.find({
            salaoId: req.params.salaoId,
            status: 'A',
        })
            .populate('clienteId')
            .select('clienteId');

        res.json({
            error: false,
            clientes: clientes.map((c) => ({
                ...c.clienteId._doc,
                vinculoId: c._id
            })),
        });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.delete('/vinculo/:id', async (req, res) => {
    try {
        await SalaoCliente.findByIdAndUpdate(req.params.id, { status: 'I' });
        res.json({ error: false });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

module.exports = router