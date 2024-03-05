const express = require('express');
const app = express();
const morgan = require('morgan');
const busboy = require('connect-busboy');



const cors = require('cors');

// DATABASE
require('./database');



app.use(express.json());


app.use(morgan('dev'));
app.use(busboy());
app.use(express.json());
app.use(cors());

app.set('port', 8000);
//Rotas

app.use('/salao', require('./src/routes/salao.routes'))
app.use('/servico', require('./src/routes/servico.routes'))
app.use('/horario', require('./src/routes/horario.routes'))
app.use('/colaborador', require('./src/routes/colaborador.routes'))


app.listen(app.get('port'), () => {
    console.log(`WS Escutando na porta ${app.get('port')}`)
});
