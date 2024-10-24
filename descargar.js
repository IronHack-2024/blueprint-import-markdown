const fs = require('fs');
const fetch = require('node-fetch');
const { title } = require('process');
const args = process.argv.slice(2);

const MARKDOWN_URL = args[0];
let titulo = args [1];

// Función asíncrona para descargar el Markdown
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

// Función para convertir el Markdown a JSON
function convertiraJson(markdown) {
  const questions = [];
  let match;
  
  // Expresiones regulares
  const titleRegex = /^## (.+)$/gm; // Obtener los títulos
  const questionRegex = /#### Q\d+[\s\S]*?(?=#### Q\d+|$)/g; // Obtener preguntas
  const codeBlockRegex = /```([\s\S]*?)```/g; // Ejercicios entre ``` ```
  const correctAnswerRegex = /- \[x\] (.+)/g; // Respuesta correcta
  const incorrectAnswerRegex = /- \[ \] (.+)/g; // Respuestas erróneas

 
  // Reiniciar la búsqueda de preguntas
  
  // Procesar cada bloque de preguntas
  while ((match = questionRegex.exec(markdown)) !== null) {
    const questionBlock = match[0]; // Bloque de preguntas
    let questionText = questionBlock.replace(/#### Q\d+\s*./, '¿').split('\n')[0].trim(); // Quitar la primera parte
    questionText = questionText.replace('?', ' ?'); // Asegurar espacio antes del signo de interrogación
    
    // Bloques de código
    const codeBlocks = [...questionBlock.matchAll(codeBlockRegex)].map(m => m[1]); // Bloque de ejercicios en preguntas
    // Respuestas
    const correctAnswers = [...questionBlock.matchAll(correctAnswerRegex)].map(m => m[1]);
    const incorrectAnswers = [...questionBlock.matchAll(incorrectAnswerRegex)].map(m => m[1]);
   
    const answersOptions = getAnswersOptions(correctAnswers, incorrectAnswers);
    
    // Crear el objeto
    const question = {
      question: questionText,
      codeExamples: codeBlocks,
      answersOptions
    
    };

    questions.push(question); // Añadimos al array
  }

  function getAnswersOptions (correctAnswers, incorrectAnswers){
    const answersOptions = incorrectAnswers.map( a => {return{answer: a, isCorrect: false}}).concat(correctAnswers.map( a => {return{answer: a, isCorrect: true}}));

    return answersOptions
  };

  const document =[{
    urlFont: MARKDOWN_URL,
    questions
  }]

  // Guardar el array de objetos en un archivo JSON
  fs.writeFileSync(`ListaJson/${titulo}.json`, JSON.stringify(document, null, 2));
  console.log(`Se convirtió a JSON y se guardó en ${titulo}.json`);
  
}

// Ejecutar la descarga y conversión
descargarMarkdown();
