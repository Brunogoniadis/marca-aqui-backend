/* cSpell:disable */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const servico = new Schema({

    salaoId: {
        type: mongoose.Types.ObjectId,
        ref: 'Salao',
        required: true
    },
    titulo: {
        type: String,
        require: true
    },
    preco: {
        type: Number,
        require: true
    },
    duracao: {
        type: Number,
        require: true
    },
    recorrencia: {
        type: Number,
        require: true
    },
    descricao: {
        type: String,
        require: true
    },
    status: {
        type: String,
        require: true
    },
    status: {
        type: String,
        enum: ['A', 'I', 'E'],
        required: true,
        default: 'A'
    },

    dataCadastro: {
        type: Date,
        default: Date.now
    }
})

servico.index({ geo: '2dsphere' })

module.exports = mongoose.model('Servico', servico)