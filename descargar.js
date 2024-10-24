const fs = require('fs');
const fetch = require('node-fetch');
const { title } = require('process');
const file = 'descarga.txt';
let titulo='';
// Cambia la URL a la correcta para descargar el archivo Markdown
const MARKDOWN_URL = 'https://raw.githubusercontent.com/Ebazhanov/linkedin-skill-assessments-quizzes/refs/heads/main/angular/angular-quiz.md';

// Función asíncrona para descargar el Markdown
async function descargarMarkdown() {
  try {
    const response = await fetch(MARKDOWN_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const markdown = await response.text();
    fs.writeFileSync(file, markdown);
    console.log('Se descargó el txt');
    
    const convertir = fs.readFileSync(file, 'utf-8'); // Se lee el archivo   
    convertiraJson(convertir);
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

  // Obtener todos los títulos del archivo
  const titles = [];
  while ((match = titleRegex.exec(markdown)) !== null) {
    titles.push(match[1].trim()); // Guardar el título
  }
  titulo=titles;
  // Reiniciar la búsqueda de preguntas
  let titleIndex = -1; // Índice para asociar cada pregunta con su título
  
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
    // Incrementar el índice del título para cada pregunta
    if (questions.length % 1 === 0 && titleIndex < titles.length - 1) {
      titleIndex++;
    }

    // Crear el objeto
    const question = {
      title: titles[titleIndex], 
      question: questionText,
      codeExamples: codeBlocks,
      correctAnswers,
      incorrectAnswers
    };

    questions.push(question); // Añadimos al array
  }

  // Guardar el array de objetos en un archivo JSON
  fs.writeFileSync(`ListaJson/${titulo}.json`, JSON.stringify(questions, null, 2));
  console.log(`Se convirtió a JSON y se guardó en ${titulo}.json`);
  try {
    fs.unlinkSync(file);
    console.log(`${file} eliminado`);
  } catch (err) {
    console.error('Error al eliminar ', err);
  }
}

// Ejecutar la descarga y conversión
descargarMarkdown();
