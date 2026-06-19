
Topics: como hacer un cuento, cómo hacer un cómic, cadena alimenticia para niños
Genera un zip descargable con todos los json dentro
Asegurate que los artículos y sus actividades sean únicos
Cumpla estrictamente todas las reglas avanzadas
Cumpla literalmente cada requisito aunque necesites construir un JSON muy grande
Valídalo antes de enviarmelo


OBJETIVO
Generar un JSON completo a partir de un único topic proporcionado por el usuario.
El contenido debe estar orientado a alumnado de Educación Primaria (6 a 9 años), con enfoque pedagógico real y actividades imprimibles.

ESTRUCTURA GENERAL

{
  "topic": {},
  "articles": []
}

REGLAS GENERALES

- Generar siempre 5 artículos.
- Cada artículo debe tener:
  - slug
  - title
  - excerpt
  - metaDescription
  - featuredImage
  - keywords
  - sections
  - worksheets

- excerpt debe tener máximo 160 caracteres.
- description de worksheets máximo 80 caracteres.
- keywords entre 3 y 5 elementos.
- featuredImage:
  /uploads/fichas-[slug].webp

SECTIONS

Cada article debe contener:

1. paragraph inicial
2. heading nivel 2
3. contenido educativo
4. sección final "Curiosidades"

REGLAS PARA PARAGRAPH

- Todo section.type="paragraph" debe contener mínimo 600 caracteres.
- Debe estar redactado para niños.
- Lenguaje sencillo.
- Información correcta y educativa.
- Explicar ejemplos reales.

SECCIÓN CURIOSIDADES

Añadir siempre al final:

{
  "type": "heading",
  "level": 2,
  "text": "Curiosidades"
}

{
  "type": "list",
  "items": []
}

Reglas:
- Entre 3 y 4 curiosidades o "sabias que" que aporten valor.
- Datos interesantes.
- Adaptados a primaria.

WORKSHEETS

- Cada worksheet debe contener mínimo 2 actividades.
- Máximo 4 actividades.
- Mezclar tipos distintos.

INSTRUCTIONS

Todos los campos instruction:
- Lenguaje para niños de 7 u 8 años.
- Frases cortas.
- Claras.
- No usar lenguaje técnico.

PROHIBIDO

Nunca terminar actividades con frases como:
- Revisa tu respuesta.
- Explica cómo lo has resuelto.
- Justifica tu respuesta.

HUECOS

Siempre que aparezcan líneas para completar:

__________________

- Mínimo 15 guiones bajos.

==================================================
REGLAS POR TIPO DE ACTIVIDAD
==================================================

1. wordBankParagraph

Campos:

{
  "type": "wordBankParagraph",
  "title": "",
  "words": [],
  "text": "",
  "instruction": ""
}

Reglas:

- 6 a 12 palabras.
- Todas las palabras deben utilizarse.
- Texto alrededor de 300 caracteres.
- Entre 5 y 8 huecos.
- Huecos largos.
- Correspondencia clara.

--------------------------------------------------

2. oddOneOutGroups

Campos:

{
  "type": "oddOneOutGroups",
  "title": "",
  "groups": [],
  "instruction": ""
}

Reglas:

- 3 a 5 grupos.
- 4 a 6 elementos por grupo.
- Solo un elemento incorrecto.
- Respuesta clara.

--------------------------------------------------

3. chooseWord

Campos:

{
  "type": "chooseWord",
  "title": "",
  "items": [],
  "instruction": ""
}

Reglas:

- 3 a 6 preguntas.
- 4 opciones exactas.
- 1 correcta.
- Distractores plausibles.

--------------------------------------------------

4. chooseAnswer

Campos:

{
  "type": "chooseAnswer",
  "title": "",
  "items": [],
  "instruction": ""
}

Reglas:

- 3 a 6 preguntas.
- Cada item con 3 o 4 opciones.
- Solo una correcta.
- Opciones cortas.

--------------------------------------------------

5. matchingColumns

Campos:

{
  "type": "matchingColumns",
  "title": "",
  "left": [],
  "right": [],
  "instruction": ""
}

Reglas:

- Igual número de elementos.
- 4 a 8 parejas.
- Relaciones únicas.

--------------------------------------------------

6. readingComprehension

Campos:

{
  "type": "readingComprehension",
  "title": "",
  "text": "",
  "questions": [],
  "instruction": ""
}

Reglas:

- Texto entre 350 y 700 caracteres.
- 4 a 6 preguntas.
- Respuestas localizables en el texto.
- No preguntas de opinión.

--------------------------------------------------

7. fillBlanks

Campos:

{
  "type": "fillBlanks",
  "title": "",
  "lines": [],
  "instruction": ""
}

Reglas:

- 4 a 8 frases.
- Todos los huecos con mínimo 15 guiones bajos.
- Relacionadas con el contenido.

--------------------------------------------------

8. drawingBox

Campos:

{
  "type": "drawingBox",
  "title": "",
  "instruction": ""
}

Reglas:

- Indicar claramente qué dibujar.
- Relacionado con el artículo.
- Adecuado para 6-9 años.

--------------------------------------------------

textLines

Campos:

{
"type": "textLines",
"title": "",
"lines": [],
"instruction": ""
}

Reglas:

Entre 4 y 12 líneas.
Puede utilizarse para copia, escritura o ejercicios.
Si la actividad es de copia, las frases deben ser cortas y apropiadas para Primaria.

Si el campo "instruction" contiene expresiones como:

"Copia las frases..."
"Copia estas frases..."
"Copia las oraciones..."
"Escribe de nuevo las frases..."

entonces en "lines" debe alternarse:

Frase modelo.
Línea para copiar.

Ejemplo:

"instruction": "Copia las frases con buena letra.",

"lines": [
"Gema comparte galletas.",
"___________________________________________",

"Gonzalo lleva una gorra.",
"___________________________________________",

"El gato mira el globo.",
"___________________________________________",

"La guitarra suena suave.",
"___________________________________________",

"Guardo palabras en mi cuaderno.",
"___________________________________________"
]

Reglas adicionales:

Cada frase debe ir seguida inmediatamente de su línea de copia.
La línea de copia debe contener al menos 35 guiones bajos.
Nunca agrupar todas las frases primero y todas las líneas después.
Debe existir exactamente una línea de copia por cada frase.
El número total de líneas debe ser siempre par cuando se trate de ejercicios de copia.
Las frases deben estar relacionadas con el tema del artículo.
Las frases deben ser comprensibles para alumnado de 6 a 9 años.

==================================================
VALIDACIÓN FINAL
==================================================

Antes de entregar:

✓ JSON válido
✓ 5 artículos
✓ paragraph ≥ 600 caracteres
✓ description ≤ 80 caracteres
✓ wordBankParagraph ≈ 300 caracteres
✓ chooseAnswer con 3-4 opciones
✓ mínimo 2 actividades por worksheet
✓ curiosidades incluidas
✓ instrucciones para niños
✓ contenido pedagógico real
