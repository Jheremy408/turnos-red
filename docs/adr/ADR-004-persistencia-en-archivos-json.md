# Persistencia en archivos JSON y estado en memoria

## Fecha

2026-09-28

## Estado

Aceptado

## Contexto

TurnosRed no utiliza actualmente una base de datos. Su estado se distribuye entre archivos JSON y estructuras mantenidas en memoria durante la ejecución:

- `data/turnos.json` se lee al iniciar el servidor para cargar el estado inicial de los turnos. Después de esa carga, las operaciones CRUD trabajan sobre la colección en memoria y sus mutaciones no se escriben nuevamente en `turnos.json`.
- `data/usuarios.json` almacena los usuarios registrados. El servicio de autenticación lee el archivo y lo reescribe con los datos de usuario, incluido el hash bcrypt y nunca la contraseña en texto plano.
- Los médicos se inicializan y mantienen en memoria. Sus cambios no se persisten en un archivo ni en una base de datos.

Este diseño es suficiente para el alcance académico actual y evita incorporar infraestructura de datos adicional. Sin embargo, no ofrece las garantías necesarias para un sistema con múltiples solicitudes concurrentes, más de un proceso o requisitos fuertes de durabilidad.

## Decisión

Se acepta temporalmente el uso actual de JSON y memoria para esta fase de TurnosRed, documentando explícitamente sus límites:

- `turnos.json` continúa siendo únicamente una fuente de carga inicial.
- `usuarios.json` continúa siendo la persistencia simple de usuarios.
- Los turnos y médicos continúan operando en memoria durante la ejecución.
- No se afirma ni se incorpora persistencia completa para las mutaciones de turnos o médicos.
- No se agrega una base de datos como parte de esta actividad.

Esta decisión es transitoria. Antes de utilizar el sistema en un entorno productivo o escalarlo, la persistencia deberá migrarse a una base de datos relacional o NoSQL seleccionada según las necesidades futuras de consistencia, consultas, relaciones, volumen y escalabilidad.

## Riesgos y limitaciones

### Concurrencia y escrituras simultáneas

La actualización de un archivo JSON suele requerir leer, modificar y reescribir el contenido completo. Dos registros de usuario concurrentes pueden leer el mismo estado y escribir resultados distintos, haciendo que la última escritura sobrescriba cambios anteriores. No existe bloqueo distribuido ni control de concurrencia equivalente al que ofrece una base de datos.

### Pérdida de datos

Los cambios de turnos y médicos mantenidos en memoria desaparecen cuando el proceso se reinicia o falla. En el caso de usuarios, una escritura interrumpida o sobrescrita puede perder registros que ya habían sido aceptados por la aplicación.

### Corrupción o truncamiento

Si el proceso, el equipo o el almacenamiento falla durante la reescritura de `usuarios.json`, el archivo puede quedar incompleto o contener JSON inválido. El diseño actual no incorpora escritura atómica con reemplazo seguro, journaling ni verificación de integridad persistente.

### Ausencia de transacciones

No existe una unidad transaccional que permita confirmar o revertir de forma atómica cambios relacionados. Tampoco hay garantías ACID, aislamiento entre operaciones ni una forma segura de coordinar futuras escrituras entre usuarios, turnos y médicos.

### Escalabilidad horizontal y consistencia entre procesos

Cada proceso de Node.js tendría su propia copia de turnos y médicos en memoria. Varias instancias podrían devolver estados diferentes. Un archivo JSON local tampoco constituye almacenamiento compartido seguro para escrituras concurrentes, por lo que agregar instancias detrás de un balanceador produciría problemas de consistencia y coordinación.

### Recuperación ante fallos

No existen copias de seguridad automáticas, historial de cambios, replicación, recuperación a un punto temporal ni mecanismos automáticos de restauración. La reconstrucción dependería de los archivos disponibles y los datos en memoria se perderían definitivamente.

### Consultas y evolución del modelo

Al crecer los datos, leer y reescribir documentos completos se vuelve costoso. La ausencia de índices, restricciones referenciales, migraciones y herramientas de consulta dificulta mantener integridad y evolucionar el modelo.

## Consecuencias

Consecuencias positivas en la fase actual:

- La solución es sencilla y fácil de ejecutar localmente.
- No requiere instalar ni administrar un servidor de base de datos.
- Los archivos JSON son legibles y apropiados para datos académicos pequeños y controlados.
- La carga inicial de turnos permite demostrar procesamiento de archivos y normalización de datos.

Costos y riesgos aceptados temporalmente:

- No hay durabilidad para mutaciones de turnos ni médicos.
- La persistencia de usuarios es vulnerable a carreras entre escrituras.
- No existen transacciones ni coordinación segura entre procesos.
- Un reinicio puede restaurar los turnos al contenido inicial del archivo y perder cambios realizados durante la ejecución.
- El diseño no es adecuado para despliegue horizontal ni para información crítica.
- La recuperación frente a corrupción o fallos es manual y limitada.

## Recomendación para la siguiente fase

Se recomienda migrar la persistencia a una tecnología diseñada para acceso concurrente y recuperación ante fallos:

- Una **base de datos relacional**, como PostgreSQL, sería apropiada si se priorizan relaciones entre usuarios, médicos y turnos, integridad referencial, restricciones, transacciones y consultas estructuradas.
- Una **base de datos NoSQL** podría evaluarse si los requisitos futuros favorecen documentos flexibles, patrones de acceso específicos o escalabilidad distribuida, siempre definiendo explícitamente las garantías de consistencia necesarias.

La elección debe basarse en requisitos medibles. En ambos casos, la siguiente fase debería incluir migraciones, índices, restricciones de unicidad, manejo transaccional, estrategia de backups, recuperación, configuración por entorno y pruebas de integración con la capa de persistencia.

## Alternativas consideradas

1. **Mantener indefinidamente JSON y memoria.** Minimiza infraestructura, pero no resuelve concurrencia, durabilidad, transacciones ni escalabilidad.
2. **Agregar bloqueos y escrituras atómicas sobre JSON.** Reduciría algunos riesgos locales, aunque seguiría sin ofrecer consultas, relaciones, coordinación distribuida ni recuperación comparables a una base de datos.
3. **Adoptar una base de datos relacional.** Aporta integridad, transacciones y un modelo adecuado para las relaciones del dominio, a cambio de configuración, migraciones y operación adicionales.
4. **Adoptar una base de datos NoSQL.** Puede ofrecer flexibilidad y opciones de distribución, pero requiere escoger cuidadosamente el modelo y las garantías de consistencia.

## Impacto sobre el proyecto

Este ADR no cambia el comportamiento actual ni agrega dependencias. Hace explícito que la persistencia vigente es una solución académica temporal y establece la migración a una base de datos relacional o NoSQL como recomendación para una fase posterior.
