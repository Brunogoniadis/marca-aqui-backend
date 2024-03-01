const mongoose = require('mongoose');
const URI = 'mongodb+srv://salaoUser:4Ptc8RwMGdLJ2NRs@clustermarcaaquidev.fn78gmb.mongodb.net/marca-aqui?retryWrites=true&w=majority&appName=ClusterMarcaAquiDev';
//ver dotenv


mongoose
    .connect(URI)
    .then(() => { console.log('DB is Up!') })
    .catch(() => { console.log('error') })