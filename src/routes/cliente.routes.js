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
module.exports = router