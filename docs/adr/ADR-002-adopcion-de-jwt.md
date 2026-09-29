# Adopción de JWT para autenticación y autorización

## Fecha

2026-09-28

## Estado

Aceptado

## Contexto

TurnosRed necesita identificar a quienes ejecutan operaciones que modifican turnos y médicos, manteniendo públicas las consultas de esos recursos. La aplicación utiliza Express 4 y dispone de un manejo centralizado de errores, por lo que el mecanismo de autenticación debe integrarse con sus middlewares y conservar el contrato uniforme de respuestas.

La aplicación también requiere un registro básico de usuarios sin almacenar contraseñas en texto plano. Como alcance de esta fase, todos los usuarios registrados reciben el rol `usuario`; todavía no existen permisos diferenciados por rol.

## Decisión

Se adopta autenticación basada en JSON Web Tokens con las siguientes características:

- `POST /auth/registro` valida el email y la contraseña, normaliza el email y asigna el rol `usuario` desde el servidor.
- Las contraseñas se transforman en hashes mediante `bcryptjs` antes de persistirse en `data/usuarios.json`. La contraseña original nunca se almacena.
- `POST /auth/login` compara la contraseña mediante bcrypt y, si las credenciales son válidas, genera un JWT con `jsonwebtoken`.
- Los tokens se firman mediante el algoritmo `HS256`.
- El secreto se obtiene exclusivamente de la variable de entorno `JWT_SECRET`; no existe un secreto predeterminado en el código.
- Cada token expira una hora después de su emisión.
- El payload incluye obligatoriamente `id` y `rol`, además de los claims temporales administrados por la biblioteca.
- El middleware `verificarToken` lee `Authorization: Bearer <token>`, verifica firma, algoritmo, expiración y claims requeridos, y asigna `{ id, rol }` a `req.user`.
- `POST`, `PUT` y `DELETE` de `/turnos` y `/medicos` requieren un JWT válido.
- Los métodos `GET` de `/turnos` y `/medicos`, incluidos los recursos por ID, permanecen públicos.
- La ausencia de token responde HTTP 401 con `AUTH_TOKEN_MISSING`.
- Un token malformado, con firma incorrecta, payload inválido o expirado responde HTTP 401 con `AUTH_TOKEN_INVALID`.

La autenticación identifica al usuario, pero en esta fase no se implementa autorización diferenciada entre roles.

## Gestión de secretos y expiración

`JWT_SECRET` debe definirse por entorno con un valor fuerte, privado y diferente para cada despliegue. El archivo `.env` local está ignorado por Git y no debe compartirse ni versionarse. Los tokens, contraseñas, hashes y headers `Authorization` tampoco deben incorporarse al repositorio ni exponerse en logs.

La expiración de una hora limita el tiempo durante el cual un token comprometido puede utilizarse. La implementación actual no incluye refresh tokens, revocación anticipada ni rotación automatizada del secreto; estas capacidades deberán evaluarse si cambian los requisitos de seguridad.

## Consecuencias

Consecuencias positivas:

- Las operaciones de escritura dejan de ser anónimas.
- La verificación es autocontenida y no requiere consultar una sesión del servidor en cada solicitud.
- El payload proporciona una identidad y un rol disponibles mediante `req.user`.
- Las contraseñas persistidas quedan protegidas mediante hashes bcrypt.
- Los GET públicos conservan compatibilidad con los consumidores anteriores.
- El contrato de autenticación está documentado en OpenAPI y puede probarse desde Postman y Supertest.

Riesgos y trade-offs:

- Un JWT robado puede utilizarse hasta que expire; no existe revocación inmediata en esta fase.
- `HS256` utiliza un secreto compartido: su exposición permitiría firmar tokens válidos.
- Cambiar `JWT_SECRET` invalida todos los tokens emitidos previamente.
- El archivo JSON de usuarios no ofrece las garantías de concurrencia y durabilidad de una base de datos.
- La existencia del claim `rol` no constituye por sí sola autorización; cualquier política diferenciada requerirá un middleware y reglas adicionales.
- En un despliegue real, los tokens deben transportarse mediante HTTPS. La configuración Nginx actual de la actividad utiliza únicamente HTTP y no aporta cifrado en tránsito.

## Alternativas consideradas

1. **Sesiones almacenadas en servidor.** Permiten revocación centralizada, pero introducen estado de sesión que debe compartirse al escalar horizontalmente.
2. **API keys.** Son útiles para ciertas integraciones entre servicios, pero no representan adecuadamente el registro y login de usuarios de TurnosRed.
3. **OAuth 2.0 u OpenID Connect con un proveedor externo.** Aportan flujos estandarizados y gestión delegada de identidad, con una integración y operación mayores a las requeridas en esta fase académica.
4. **JWT firmado con HS256.** Satisface el alcance actual con una implementación acotada y compatible con distintos clientes. Esta es la alternativa adoptada.

## Impacto sobre el proyecto

La adopción incorporó el modelo y la persistencia de usuarios, schemas Zod de registro y login, servicios con bcrypt y `jsonwebtoken`, rutas `/auth`, configuración obligatoria de `JWT_SECRET`, tipado de `req.user` y el middleware `verificarToken`.

También cambió el contrato de las escrituras sobre turnos y médicos, que ahora requieren `Authorization: Bearer <token>` y pueden responder HTTP 401. OpenAPI declara `bearerAuth`, la colección Postman captura el token del login y las pruebas automatizadas cubren autenticación y acceso protegido.
