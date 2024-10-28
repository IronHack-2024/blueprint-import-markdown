const fs = require('fs');
const fetch = require('node-fetch');
const { title } = require('process');

//Permite pasar parámetors por script. Ej se ejecute. node /nombre_del_archivo URL nombre_fichero_json

//Ignora los dos primeros parámetro introducidos en línea de comando "node" y "/nombre_del_archivo"
const args = process.argv.slice(2);

const MARKDOWN_URL = args[0];
let titulo = args [1];

// Función asíncrona para descargar el Markdown y llamar a la función que lo convierte a json y lo guarda en un archivo
async function descargarMarkdown() {
  try {
    const response = await fetch(MARKDOWN_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdown = await response.text();
    
    convertiraJson(markdown);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Función para convertir el Markdown a JSON y guardarlo en un archivo
function convertiraJson(markdown) {
  const questions = [];
  let match;
  
  // Expresiones regulares para extraer acada parte del documento desde formato markdown que se utiliza en las preguntas de LinkedIn 

  const titleRegex = /^## (.+)$/gm; // Obtener los títulos que en nuestra API serán las categorias (de momento  NO LO USAMOS). Es uno por documento. Ejemplo: JS, CSS, HTML, etc
  const questionRegex = /#### Q\d+[\s\S]*?(?=#### Q\d+|$)/g; // Obtener preguntas
  const codeExamplesRegex = /```([\s\S]*?)```/g; // Ejercicios entre ``` ```
  const correctAnswerRegex = /- \[x\] (.+)/g; // Respuesta correcta
  const incorrectAnswerRegex = /- \[ \] (.+)/g; // Respuestas erróneas

 
  
  // Procesar cada bloque de preguntas
  while ((match = questionRegex.exec(markdown)) !== null) {
    const questionBlock = match[0]; // Bloque de preguntas
    let questionText = questionBlock.replace(/#### Q\d+\s*./, '').split('\n')[0].trim(); // Quitar la primera parte
    // questionText = questionText.replace('?', ' ?'); // Asegurar espacio antes del signo de interrogación
    
    // Bloques de código
    const codeExampless = [...questionBlock.matchAll(codeExamplesRegex)].map(m => m[1]); // Bloque de ejercicios en preguntas
    // Opciones
    const correctAnswers = [...questionBlock.matchAll(correctAnswerRegex)].map(m => m[1]);
    const incorrectAnswers = [...questionBlock.matchAll(incorrectAnswerRegex)].map(m => m[1]);
   
    //llama a la funcion crea el array de opciones, poniendo las tres incorrectas primero y la correcta (True) al final
    const answersOptions = getAnswersOptions(correctAnswers, incorrectAnswers);
    
    // Crear el objeto
    const question = {
      question: questionText,
      codeExamples: codeExampless,
      answersOptions
    
    };

    questions.push(question); // Añadimos al array
  }

  //funcion que crea el array de opciones, poniendo las tres incorreectas primero y la correcta (True) al final
  function getAnswersOptions (correctAnswers, incorrectAnswers){
    const answersOptions = incorrectAnswers.map( a => {return{answer: a, isCorrect: false}}).concat(correctAnswers.map( a => {return{answer: a, isCorrect: true}}));

    return answersOptions
  };

  //Crea el documento final
  const document =[{
    urlFont: MARKDOWN_URL,
    questions
  }]

  //Crea la carpeta ListaJson si no existe
  const path = 'ListaJson';
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  
  // Guardar el array de objetos en un archivo JSON
  fs.writeFileSync(`ListaJson/${titulo}.json`, JSON.stringify(document, null, 2));
  console.log(`Se convirtió a JSON y se guardó en ${titulo}.json`);
  
}

// Ejecutar la descarga y conversión
descargarMarkdown();
