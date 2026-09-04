# Turnos Red

Actividad académica desarrollada con Node.js, TypeScript y Express para administrar turnos. La aplicación expone una API HTTP, carga sus datos iniciales desde un archivo JSON y retransmite eventos de creación, actualización y eliminación en tiempo real mediante Socket.IO.

## Requisitos previos

- Node.js `24.20.0`, versión indicada en `.nvmrc`.
- npm para instalar las dependencias y ejecutar los scripts del proyecto.

## Instalación

1. Ubicarse en la raíz del proyecto.
2. Instalar las dependencias:

   ```bash
   npm install
   ```

3. Crear un archivo `.env` a partir de `.env.example` y ajustar sus valores si es necesario.
4. Compilar el código TypeScript:

   ```bash
   npm run build
   ```

5. Iniciar el servidor:

   ```bash
   npm start
   ```

Con los valores de ejemplo, la aplicación queda disponible en `http://localhost:3000`.

## Variables de entorno

| Variable | Valor de ejemplo | Descripción |
| --- | --- | --- |
| `PORT` | `3000` | Puerto en el que escucha el servidor HTTP. |
| `DATA_PATH` | `./data/turnos.json` | Ruta del archivo JSON utilizado para cargar los turnos iniciales. |

Estas variables están declaradas en `.env.example`. Si no se definen, el servidor utiliza esos mismos valores como valores predeterminados.

## Scripts npm

| Script | Comando | Descripción |
| --- | --- | --- |
| `npm run build` | `tsc` | Compila los archivos TypeScript de `src/` y genera el JavaScript en `dist/`. |
| `npm start` | `node dist/server.js` | Inicia la aplicación a partir del código JavaScript compilado. Requiere haber ejecutado previamente `npm run build`. |
| `npm run dev` | `node --watch dist/server.js` | Ejecuta el servidor compilado en modo observación. Reinicia el proceso cuando cambia el contenido observado en `dist/`, pero no compila automáticamente los archivos TypeScript de `src/`. |

## Estructura del proyecto

```text
turnos-red/
├── data/
│   └── turnos.json
├── public/
│   └── index.html
├── src/
│   ├── controllers/
│   │   └── turno.controller.ts
│   ├── events/
│   │   └── turno.events.ts
│   ├── models/
│   │   └── turno.model.ts
│   ├── routes/
│   │   └── turno.routes.ts
│   ├── services/
│   │   └── turno.service.ts
│   ├── utils/
│   │   ├── ejemploCallback.ts
│   │   └── normalizarTurno.ts
│   └── server.ts
├── .env.example
├── .nvmrc
├── package-lock.json
├── package.json
└── tsconfig.json
```

- `data/`: contiene el archivo JSON con los turnos que se cargan al iniciar la aplicación.
- `public/`: contiene la página estática que recibe y muestra los eventos enviados mediante Socket.IO.
- `src/controllers/`: contiene los controladores de las operaciones HTTP sobre turnos.
- `src/events/`: contiene el bus de eventos internos basado en `EventEmitter`.
- `src/models/`: define las interfaces TypeScript de los turnos.
- `src/routes/`: registra las rutas HTTP y las vincula con sus controladores.
- `src/services/`: contiene la lectura y el procesamiento inicial de los datos.
- `src/utils/`: contiene funciones auxiliares de normalización y un ejemplo de lectura mediante callback.
- `src/server.ts`: configura Express, crea el servidor HTTP, integra Socket.IO y pone en marcha la aplicación.
- `dist/`: se genera mediante `npm run build` y contiene el JavaScript compilado. No debe editarse manualmente.

## Endpoints disponibles

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/turnos` | Obtiene todos los turnos cargados. |
| `GET` | `/turnos/:id` | Obtiene un turno por su identificador. |
| `POST` | `/turnos` | Crea un turno. |
| `PUT` | `/turnos/:id` | Actualiza un turno existente. |
| `DELETE` | `/turnos/:id` | Elimina un turno existente. |

## Eventos en tiempo real

La página `public/index.html` se conecta al servidor mediante Socket.IO y escucha los siguientes eventos:

- `turno:nuevo`
- `turno:actualizado`
- `turno:eliminado`

Cuando se crea, actualiza o elimina un turno mediante la API, el servidor retransmite el turno correspondiente a los clientes conectados sin recargar la página ni realizar consultas periódicas.
