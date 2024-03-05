const express = require('express');
const router = express.Router();
const multer = require('multer');
const aws = require('../services/aws');
const Arquivo = require('../models/arquivo');
const Servico = require('../models/servico');
const { json } = require('body-parser');
const servico = require('../models/servico');

const storage = multer.memoryStorage()

const upload = multer({ storage: storage });

/* ATENCAO: RECEBENDO UM FORMDATA - MULTPART */
router.post('/', upload.any(), async (req, res) => {
    try {
        let errors = [];
        let arquivos = [];

        if (req.files && req.files.length > 0) {
            for (let file of req.files) {

                const fileName = `${new Date().getTime()}.`

                const path = `servicos/${req.body.salaoId}/${file.originalname}`;

                // Enviar o arquivo para o Amazon S3

                const response = await aws.uploadToS3({ Body: file.buffer }, path);

                if (response.error) {
                    errors.push({ error: true, message: response.message.message });
                } else {
                    arquivos.push(path);
                }
            }
        }

        if (errors.length > 0) {
            res.json(errors[0]);
            return;
        }

        // CRIAR SERVIÇO
        const servico = await Servico.create(JSON.parse(req.body.servico));

        // CRIAR ARQUIVO
        arquivos = arquivos.map((arquivo) => ({
            referenciaId: servico._id,
            model: 'Servico',
            caminho: arquivo,
        }));
        await Arquivo.insertMany(arquivos);

        res.json({ error: false, arquivos });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.put('/:id', upload.any(), async (req, res) => {
    try {
        const { salaoId, servico } = req.body;
        let errors = [];
        let arquivos = [];

        if (req.files && req.files.length > 0) {
            for (let file of req.files) {
                const path = `servicos/${req.body.salaoId}/${file.originalname}`;

                // Enviar o arquivo para o Amazon S3
                const response = await aws.uploadToS3({ Body: file.buffer }, path);

                if (response.error) {
                    errors.push({ error: true, message: response.message.message });
                } else {
                    arquivos.push(path);
                }
            }
        }

        if (errors.length > 0) {
            res.json(errors[0]);
            return;
        }

        // Atualizar Serviço
        const updatedServico = await Servico.findByIdAndUpdate(
            req.params.id,
            JSON.parse(servico),
            { new: true, runValidators: true }
        );

        // CRIAR ARQUIVO
        arquivos = arquivos.map((arquivo) => ({
            referenciaId: req.params.id,
            model: 'Servico',
            caminho: arquivo,
        }));
        await Arquivo.insertMany(arquivos);

        res.json({ error: false });
    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.get('/salao/:salaoId', async (req, res) => {
    try {
        const { salaoId } = req.params;

        let servicosSalao = [];

        const servicos = await Servico.find({
            salaoId,
            status: 'A'
        });
        console.log('servicos', servicos)

        for (let servico of servicos) {
            const arquivos = await Arquivo.find({
                model: 'Servico',
                referenciaId: servico._id
            });
            servicosSalao.push({ ...servico._doc, arquivos });
        }

        res.json({
            error: false,
            servicos: servicos.map((s) => ({ label: s.titulo, value: s._id }))
        });

    } catch (error) {
        res.json({ error: true, message: error.message });
    }
});


router.post('/delete-arquivo', async (req, res) => {
    try {
        const { id } = req.body;

        // APAGAR ITEM NA AWS
        await aws.deleteFileS3(id);

        await Arquivo.findOneAndDelete({
            caminho: id,
        });

        res.json({ error: false });

    } catch (err) {
        res.json({ error: true, message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Servico.findByIdAndUpdate(id, { status: 'E' })

        res.json({ error: false })
    } catch (error) {
        res.json({ error: true, message: err.message });
    }
})


module.exports = router;
