# Uso de OpenAPI para documentar el contrato REST

## Fecha

2026-09-21

## Estado

Aceptado

## Contexto

TurnosRed es una API REST construida con Node.js, TypeScript y Express para administrar los recursos Turno y Médico. Los cuerpos de las solicitudes y los query parameters se validan con Zod, y el proyecto ya dispone de una colección Postman con ejemplos y pruebas de los endpoints.

La documentación distribuida entre el código, los schemas Zod, el README y Postman necesita conservar un contrato único y comprensible para quienes consumen y mantienen la API. Sin una representación formal del contrato REST, los tipos, parámetros, códigos HTTP y ejemplos pueden divergir cuando cambia la implementación.

La implementación actual genera una especificación OpenAPI 3.0.3 mediante `swagger-jsdoc` y publica Swagger UI en `/api-docs`. La especificación describe las operaciones existentes de Turnos y Médicos, sus filtros reales, los formatos de respuesta y el contrato uniforme de errores.

## Decisión

OpenAPI se adopta como representación formal y oficial del contrato REST de TurnosRed.

- `swagger-jsdoc` genera la especificación OpenAPI 3.0.3 a partir de la configuración y las anotaciones del proyecto.
- `swagger-ui-express` publica la documentación interactiva en `/api-docs`.
- Las anotaciones de cada operación se mantienen próximas a sus rutas Express para facilitar la revisión conjunta entre ruta, controlador y documentación.
- Los schemas OpenAPI deben permanecer alineados con las validaciones Zod, los modelos expuestos por la API y el comportamiento real del backend.
- Los query parameters y códigos HTTP documentados deben corresponder únicamente a los que la implementación admite y devuelve.
- No se documentarán mecanismos de seguridad, autenticación o autorización que no estén implementados.
- La colección Postman continúa siendo un recurso complementario para ejemplos y pruebas, no un reemplazo del contrato OpenAPI.

## Consecuencias

Consecuencias positivas:

- La API dispone de documentación navegable e interactiva.
- Los clientes externos pueden conocer con mayor claridad las operaciones, parámetros y estructuras de datos disponibles.
- La revisión conjunta de rutas, Zod, Postman y OpenAPI reduce el riesgo de divergencias documentales.
- La especificación permite considerar posteriormente validación automática, generación de clientes y pruebas de contrato.
- La integración y el mantenimiento de los recursos Turno y Médico resultan más previsibles.

Costos y riesgos:

- Las anotaciones y los schemas OpenAPI deben actualizarse cada vez que cambie el contrato HTTP.
- La documentación puede quedar desactualizada si un cambio de código no incluye la revisión de OpenAPI.
- El proyecto incorpora y debe mantener las dependencias de Swagger.
- Cada modificación relevante requiere una revisión cruzada con Zod, los controladores y los ejemplos de Postman.

## Alternativas consideradas

1. **Mantener solo el README.** Es adecuado para explicar instalación, arquitectura y ejemplos generales, pero no ofrece un contrato estructurado, navegable ni reutilizable por herramientas.
2. **Mantener solo la colección Postman.** Resulta útil para ejecutar solicitudes y pruebas, pero su objetivo principal no es actuar como especificación formal y puede ocultar diferencias entre ejemplos guardados y el backend.
3. **Mantener un archivo OpenAPI manual separado.** Permitiría un contrato estándar independiente del código, aunque aumentaría la distancia entre las rutas Express y su documentación y, con ello, el riesgo de actualizaciones omitidas.
4. **Generar OpenAPI desde anotaciones JSDoc.** Mantiene la descripción de las operaciones cerca de las rutas y permite servirla con Swagger UI. Esta es la alternativa adoptada porque coincide con la implementación actual basada en `swagger-jsdoc` y `swagger-ui-express`.

## Limitaciones

- OpenAPI documenta el contrato HTTP, pero no sustituye las pruebas unitarias, de integración ni las pruebas de Postman.
- La generación de la especificación no garantiza por sí sola que la implementación, Zod y OpenAPI permanezcan sincronizados.
- EventEmitter y los eventos de Socket.IO no forman parte del contrato REST principal descrito por OpenAPI.
- TurnosRed utiliza autenticación mediante JWT: las operaciones POST, PUT y DELETE de Turnos y Médicos requieren un Bearer JWT válido, mientras que los GET continúan siendo públicos.
- La especificación OpenAPI documenta `bearerAuth` y declara el requisito de seguridad únicamente en las operaciones protegidas.
- La documentación no debe anticipar rutas, filtros, persistencia o respuestas que el backend todavía no implemente.
- La exactitud del contrato continúa dependiendo de la revisión humana y de futuras verificaciones automatizadas.

## Impacto sobre el proyecto

La decisión incorpora una configuración central de Swagger, anotaciones OpenAPI en las rutas de Turnos y Médicos y la publicación de Swagger UI en `/api-docs`. A partir de ahora, cualquier cambio del contrato REST debe incluir la revisión de las rutas documentadas, los schemas OpenAPI, las validaciones Zod y los ejemplos relacionados.

La especificación podrá integrarse en el futuro con CI/CD para detectar errores estructurales o divergencias contractuales, sin que esa automatización forme parte de la decisión implementada actualmente.
