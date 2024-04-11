const express = require('express');
const moment = require('moment');
const { readFile, writeFile } = require('./src/files');
const path = require('path');
const app = express();
const fs = require('fs');
const addCreatedAtMiddleware = require('./addCreatedAtMiddleware');




function logRequest(req, res, next) {
    const now = new Date();
    const timestamp = now.toISOString();
    const formattedTimestamp = timestamp.replace('T', ' ').split('.')[0];
    const requestMethod = req.method;
    const requestUrl = req.originalUrl;
    const queryParams = JSON.stringify(req.query);
    const requestBody = JSON.stringify(req.body);
    const clientIp = req.ip;

    const logLine = `${formattedTimestamp} [${requestMethod}] [${requestUrl}] [${queryParams}] [${requestBody}] [${clientIp}]\n`;

    fs.appendFile(path.join(__dirname, './access_log.txt'), logLine, (err) => {
        if (err) {
            console.error('Error al escribir en el archivo de registro: ', err);
        }
    });

    next();
}


app.use(express.json());
app.use(logRequest);
app.use(addCreatedAtMiddleware);


app.get('/libros', (req, res) => {

    const filtro = req.query.filtro;
    const libros = readFile('./db.json');

    if (filtro) {
        const librosFiltrados = libros.filter(libro =>
            libro.Nombre.toLowerCase().includes(filtro.toLowerCase())
        );
        if (librosFiltrados.length > 0) {
            res.send({ libros: librosFiltrados });
        } else {
            res.send({ mensaje: 'No se encontraron libros que coincidan con el filtro' });
        }
    } else {
        res.send({ libros: libros });
    }
});

app.post('/libros', (req, res) => {

    const nuevoLibro = req.body;
    let libros = readFile('./db.json');

    libros.push(nuevoLibro);
    writeFile('./db.json', libros);

    res.send({ mensaje: 'Libro agregado correctamente', libro: nuevoLibro });
})


app.get('/todos/:Genero', //Primer parámetro

    (req, res, next) => { //Segundo parámetro
        logRequest(req);

        console.log('Middleware a nivel de ruta')
        next()
    },
    (req, res) => {
        const genero = req.params.id
        const librosgenero = readFile('./db.json')
        const libros = librosgenero.find(libros => libros.Genero === parseInt(req.params.Genero))
        //No Existe
        if(! libros){
            res.status(404).send('No se encuentra disponible')
            return
        }
        //Existe
        res.send(libros)
    
})

app.put('/libros/nombre/:nombre', (req, res) => {
    const nombre = req.params.nombre.toLowerCase();
    const libros = readFile('./db.json');
    const libroIndex = libros.findIndex(libro => libro.Nombre.toLowerCase() === nombre);

    if (libroIndex === -1) {
        // Si el libro no existe, envía un estado 404 indicando que no se encontró
        res.status(404).send('No se encontró el libro');
    } else {
        // Si el libro existe, actualiza sus datos
        const updatedLibro = {
            ...libros[libroIndex],
            ...req.body,
            updated_at: moment().format('YYYY-MM-DD hh:mm') // Agregar la fecha y hora actual como 'updated_at'
        };

        libros[libroIndex] = updatedLibro;

        // Escribir en el archivo
        writeFile('./db.json', libros);

        // Enviar el libro actualizado como respuesta
        res.send(updatedLibro);
    }
})




app.listen(2200, () => {
    console.log('Servidor escuchando en el puerto 2200');
});