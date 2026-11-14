# Force Redeploy

- 2

## Recomendador de fichas

El asistente usa únicamente el catálogo publicado de Web del Maestro: las entradas de la tabla `posts` y las fichas estáticas en `data/staticArticles/topics`. La clave nunca llega al navegador. Para activarlo, configura estas variables solo en el entorno del servidor:

```text
SAAS_IA_API_URL=https://tu-saas-ia.example
SAAS_IA_API_KEY=...
```

El endpoint es `POST /api/recommendations`. Limita los mensajes a 700 caracteres, aplica una cuota en memoria por IP y devuelve tarjetas resueltas desde el catálogo local; cualquier `resourceId` ajeno a esa lista se descarta. Las fichas estáticas generan su PDF en la página de ficha, por lo que el asistente no muestra un enlace de descarga hasta que exista una URL de descarga real y persistente.
