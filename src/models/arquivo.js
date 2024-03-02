const mongoose = require('mongoose');
/* cSpell:disable */

const Schema = mongoose.Schema;

const arquivo = new Schema({
    referenciaId: {
        type: Schema.Types.ObjectId,
        refPath: 'model'
    },
    model: {
        type: String,
        required: true,
        enum: ['Servico', 'Salao']
    },
    caminho: {
        type: String,
        require: true
    },
    dataCadastro: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Arquivo', arquivo);