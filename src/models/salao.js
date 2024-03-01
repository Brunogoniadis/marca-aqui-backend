/* cSpell:disable */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const salao = new Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório']
    },
    foto: String,
    capa: String,
    email: {
        type: String,
        require: [true, 'Campo é obrigatório']
    },
    senha: {
        type: String,
        default: null
    },
    telefone: String,
    endereco: {
        cidade: String,
        uf: String,
        cep: String,
        numero: String,
        pais: String,
    },
    geo: {
        tipo: String,
        coordinates: Array
    },
    dataCadastro: {
        type: Date,
        default: Date.now
    }
})

salao.index({ geo: '2dsphere' })

module.exports = mongoose.model('Salao', salao)