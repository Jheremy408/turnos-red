# Adopción futura de JWT para autenticación y autorización

## Fecha

2026-09-21

## Estado

Propuesto

## Contexto

TurnosRed no implementa actualmente autenticación ni autorización. Sus endpoints de Turnos y Médicos son públicos, no existe un flujo de login y la documentación OpenAPI no declara ningún esquema de seguridad. La Actividad 3 exige expresamente conservar este comportamiento y no introducir JWT en la implementación actual.

Una integración futura con otros clientes, usuarios o servicios podría requerir identificar quién realiza cada solicitud y restringir determinadas operaciones. Antes de incorporar un mecanismo de seguridad será necesario definir los actores, las políticas de acceso y los riesgos operativos del sistema. Este ADR registra el tema para evaluación posterior; no aprueba ni implementa todavía una solución.

## Decisión

Se propone evaluar JWT en una etapa futura como una posible alternativa para autenticación y autorización. La adopción queda condicionada a un análisis posterior de requisitos y amenazas, por lo que este ADR permanece en estado Propuesto.

Si el proyecto decidiera avanzar con JWT, el análisis debería abarcar como mínimo:

- el mecanismo real de autenticación de usuarios;
- la autorización mediante roles o permisos definidos por el dominio;
- la duración y expiración de los tokens;
- una estrategia de renovación;
- el almacenamiento y la rotación segura de secretos o claves;
- la selección y configuración del algoritmo de firma;
- la revocación de credenciales o una estrategia equivalente;
- el transporte exclusivo mediante conexiones seguras;
- las respuestas ante tokens ausentes, inválidos o vencidos;
- la incorporación posterior del esquema de seguridad correspondiente en OpenAPI.

La propuesta no define aún el diseño completo ni selecciona una biblioteca. Ningún endpoint cambia su comportamiento como resultado de este ADR.

## Consecuencias

Consecuencias potencialmente positivas:

- Sería posible controlar el acceso a operaciones que dejen de ser públicas.
- Un mecanismo basado en tokens podría facilitar una autenticación sin estado compartido entre varias instancias de la API.
- JWT puede interoperar con distintos tipos de clientes cuando existe un emisor y una política de validación claramente definidos.

Costos y riesgos potenciales:

- La autenticación y autorización agregarían complejidad al código, la configuración y la operación del proyecto.
- Los secretos o claves de firma requerirían almacenamiento, rotación y controles de acceso adecuados.
- La expiración y renovación de tokens exigirían decisiones explícitas de experiencia de usuario y seguridad.
- La revocación no es inmediata por naturaleza y necesitaría una estrategia complementaria cuando el riesgo lo requiera.
- El sistema debería operar mediante HTTPS para proteger los tokens en tránsito.
- Una configuración incorrecta de algoritmos, validaciones, audiencias o emisores podría introducir vulnerabilidades graves.
- Serían necesarias pruebas específicas de autenticación, autorización y escenarios adversos.

## Alternativas consideradas

1. **Sesiones tradicionales en servidor.** Facilitan la revocación centralizada y pueden ser apropiadas para aplicaciones web controladas, pero requieren almacenar y compartir el estado de sesión cuando existen varias instancias.
2. **API keys.** Pueden ser útiles para identificar integraciones de servicio a servicio relativamente simples, aunque por sí solas no representan bien sesiones de usuarios ni autorización detallada.
3. **OAuth 2.0 con un proveedor de identidad externo.** Puede delegar autenticación, administración de identidades y flujos estandarizados, a cambio de mayor dependencia e integración operativa con el proveedor.
4. **JWT.** Puede resultar apropiado cuando varios clientes o servicios necesitan validar afirmaciones firmadas sin consultar una sesión central en cada solicitud. Su conveniencia depende de requisitos concretos de expiración, revocación, roles, infraestructura y nivel de riesgo; no es automáticamente superior a las demás alternativas.

## Limitaciones

- JWT no está implementado en TurnosRed.
- No existe actualmente un endpoint ni un flujo de login.
- No existen usuarios, roles ni permisos definidos en el proyecto.
- No existe middleware de autenticación o autorización.
- OpenAPI no contiene `bearerAuth`, `securitySchemes` ni requisitos de seguridad.
- Este ADR no agrega dependencias, configuración, rutas ni cambios de comportamiento.
- El estado Propuesto no autoriza implementar JWT sin una decisión arquitectónica posterior y requisitos de seguridad aprobados.

## Impacto sobre el proyecto

No existe impacto funcional inmediato. Los endpoints continúan siendo públicos y los clientes actuales no necesitan enviar credenciales.

Si la propuesta fuera aceptada en el futuro, podría afectar conceptualmente los middlewares de Express, la configuración segura de secretos o claves, la documentación OpenAPI, las pruebas automatizadas, la administración de usuarios y roles y el comportamiento de los clientes consumidores. El alcance concreto deberá definirse en una decisión posterior antes de modificar el código.
