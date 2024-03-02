const express = require('express');
const router = express.Router();
const multer = require('multer');
const aws = require('../services/aws');
const Arquivo = require('../models/arquivo');
const Servico = require('../models/servico');

const storage = multer.memoryStorage()

const upload = multer({ storage: storage });

router.post('/', upload.any(), async (req, res) => {


    try {
        let errors = [];
        let arquivos = [];

        console.log('here', req.files)

        if (req.files && req.files.length > 0) {
            for (let file of req.files) {

                const fileName =`${new Date().getTime()}.`

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

module.exports = router;
