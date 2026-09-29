# Uso de Nginx como proxy inverso

## Fecha

2026-09-28

## Estado

Aceptado

## Contexto

TurnosRed expone una API HTTP con Express y mantiene comunicación en tiempo real mediante Socket.IO. La aplicación Node.js escucha en el puerto 3000. Para la etapa de despliegue académico se necesita publicar una entrada HTTP convencional en el puerto 80 sin cambiar las rutas ni la configuración de puerto del backend.

El entorno previsto para esta etapa utiliza Nginx para Windows. La configuración debe ser independiente de Docker y WSL, reenviar todo el tráfico a una única instancia local de Node.js y conservar la información básica de la solicitud original. Como Socket.IO puede utilizar WebSocket, el proxy también debe permitir la negociación de actualización de protocolo.

## Decisión

Se adopta Nginx como proxy inverso delante de TurnosRed con la siguiente topología:

- Nginx escucha solicitudes HTTP en el puerto 80.
- Todas las rutas recibidas por `http://localhost/` se reenvían a `http://127.0.0.1:3000`.
- El backend Node.js continúa escuchando en el puerto 3000; esta decisión no modifica su configuración.
- Se preserva el host solicitado mediante el header `Host`.
- Se comunica la dirección del cliente mediante `X-Real-IP`.
- Se mantiene la cadena de proxies mediante `X-Forwarded-For`.
- Se utiliza HTTP/1.1 hacia el backend y se reenvían los headers `Upgrade` y `Connection` para permitir WebSocket y Socket.IO.
- La misma regla general cubre la API, Swagger UI, los archivos servidos por Express y el endpoint de Socket.IO.

La configuración se mantiene en el archivo `nginx.conf` de la raíz del repositorio. No incorpora HTTPS, certificados, balanceo de carga ni dependencias de contenedores.

## Razones

- Permite exponer una URL sin el puerto 3000 al consumidor de la API.
- Mantiene separadas la responsabilidad de aceptar tráfico público y la ejecución de la aplicación Node.js.
- Centraliza headers de proxy y compatibilidad con actualización a WebSocket.
- Conserva las rutas existentes, por lo que clientes, Swagger y la colección Postman pueden utilizarse detrás del proxy sin cambios en el backend.
- Deja una base sencilla para incorporar controles de despliegue en fases posteriores, sin anticiparlos en esta decisión.

## Consecuencias

Consecuencias positivas:

- `http://localhost/turnos`, `http://localhost/medicos`, `http://localhost/auth/login` y `http://localhost/api-docs/` pueden llegar al mismo backend mediante el puerto 80.
- La aplicación conserva su puerto interno y no necesita ejecutar Node.js directamente en un puerto privilegiado.
- Los datos básicos del cliente original quedan disponibles en headers de proxy.
- Socket.IO puede negociar conexiones WebSocket a través de Nginx.
- La configuración es pequeña, revisable y compatible con Nginx para Windows.

Costos y trade-offs operacionales:

- Nginx pasa a ser un proceso adicional que debe iniciarse, validarse, supervisarse y recargarse cuando cambia su configuración.
- La aplicación Node.js debe estar disponible en `127.0.0.1:3000`; si no lo está, Nginx responderá con un error de gateway.
- El puerto 80 debe estar libre y el usuario debe disponer de permisos suficientes para que Nginx lo utilice.
- Los headers reenviados solo deben considerarse confiables cuando el backend se ejecuta detrás del proxy controlado.
- Una configuración incorrecta de WebSocket puede degradar las conexiones de Socket.IO o forzarlas a otros transportes.
- Esta decisión no cifra el tráfico: HTTP y el puerto 80 no equivalen a HTTPS.

## Alternativas consideradas

1. **Exponer Node.js directamente en el puerto 3000.** Es suficiente durante el desarrollo, pero obliga a los clientes a conocer el puerto del proceso y no aporta una capa de proxy.
2. **Cambiar Node.js para escuchar en el puerto 80.** Reduce un proceso, pero mezcla la exposición pública con la aplicación y puede requerir permisos adicionales. También contradice el objetivo de conservar el backend en el puerto 3000.
3. **Usar Docker o WSL.** Podrían uniformar otros escenarios de despliegue, pero no son necesarios ni forman parte del entorno elegido para esta etapa.
4. **Usar Nginx como proxy inverso.** Mantiene la aplicación sin cambios y cubre HTTP y WebSocket con una configuración acotada. Esta es la alternativa adoptada.

## Limitaciones

- Solo se configura una instancia local del backend; no existe balanceo de carga.
- No se configura TLS, redirección a HTTPS ni administración de certificados.
- No se incorporan caché, compresión, rate limiting ni políticas adicionales de seguridad.
- La validación final debe realizarse con la instalación de Nginx para Windows disponible en el equipo de ejecución.

## Impacto sobre el proyecto

Se agrega `nginx.conf` en la raíz del repositorio. No se modifican las rutas Express, Socket.IO, el puerto de Node.js ni el contrato HTTP. La operación local requiere iniciar primero TurnosRed en el puerto 3000 y luego ejecutar Nginx con esta configuración.
