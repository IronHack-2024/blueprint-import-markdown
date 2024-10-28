//SCRIPT para visualizar json en un endopoint localhost puerto 3000
const express = require('express');
const path = require('path');
const fs = require('fs');
const eje = express();
const archivoJson ='ListaJson/javascript.json';

eje.set('view engine', 'ejs'); 
eje.set('views', path.join(__dirname, 'views')); 
eje.use(express.static(path.join(__dirname, 'public'))); //midle
eje.listen(3000, () => {
    console.log("Servidor escuchando");
});

eje.get('/', (req, res) => {
    // Leer el archivo JSON
    fs.readFile(path.join(__dirname, archivoJson), 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Error en JSON.');
        }       
         const datosjson = JSON.parse(data);        
         res.json(datosjson);
    });    
});
eje.get('/maqueta', (req, res) => {
    // Leer el archivo JSON
    fs.readFile(path.join(__dirname, archivoJson), 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).send('Error en JSON.');
        }
        const datosmaqueta = JSON.parse(data);       
        res.render('index', { datosmaqueta }); // Pasar los datos a la vista
      
    });
});
