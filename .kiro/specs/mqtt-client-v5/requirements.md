# Requirements Document

## Introduction

Este documento describe los requerimientos para la implementación de un cliente MQTT v5.0 en el frontend de la aplicación, construida con Next.js. La solución se integrará con la arquitectura existente, que incluye Custom Hooks, Server Actions, TanStack Query y un sistema de autenticación que provee las credenciales para el broker MQTT (EMQX) a través de un endpoint seguro.

El objetivo es establecer una conexión persistente y segura vía WebSockets (WS) para la recepción y envío de mensajes en tiempo real, gestionando el estado de la conexión y los datos de manera eficiente y reactiva en toda la aplicación.

## Requirements

### Requirement 1: Conexión y Autenticación Segura del Cliente MQTT

**User Story:** Como usuario autenticado, quiero que la aplicación establezca una conexión segura y automática con el broker MQTT usando las credenciales obtenidas al iniciar sesión, para poder recibir y enviar datos en tiempo real sin pasos adicionales.

#### Acceptance Criteria

1. WHEN un usuario se autentica exitosamente en la plataforma THEN el sistema SHALL invocar un endpoint para obtener las credenciales de MQTT (URL del broker, username, password)
2. WHEN se reciben las credenciales THEN el sistema SHALL utilizar un Custom Hook (useMqtt) para iniciar la conexión con el broker EMQX a través de WebSockets (WS)
3. WHEN se establece la conexión THEN se SHALL utilizar el protocolo MQTT en su versión 5.0
4. WHEN la conexión es exitosa THEN el estado de la conexión ('conectado') SHALL ser gestionado globalmente
5. WHEN la conexión falla por credenciales inválidas o problemas de red THEN el sistema SHALL registrar el error y actualizar el estado de la conexión a ('desconectado')

### Requirement 2: Gestión de Estado Reactiva con TanStack Query

**User Story:** Como desarrollador, quiero que el estado de la conexión MQTT y los mensajes entrantes sean gestionados por TanStack Query, para que los componentes de la UI puedan actualizarse de forma reactiva y consistente.

#### Acceptance Criteria

1. WHEN el estado de la conexión MQTT cambie (conectado, desconectado, reconectando) THEN este estado SHALL ser almacenado y accesible a través de un query de TanStack Query
2. WHEN se recibe un mensaje en un tópico suscrito THEN el payload del mensaje SHALL ser procesado y almacenado en el caché de TanStack Query
3. WHEN un componente necesite mostrar datos en tiempo real THEN SHALL usar el hook useQuery para suscribirse a los datos del caché correspondientes a un tópico
4. WHEN se recibe un nuevo mensaje THEN el sistema SHALL invalidar la query correspondiente para forzar una actualización en la UI
5. WHEN se necesite publicar un mensaje THEN se SHALL utilizar una mutation de TanStack Query que encapsule la lógica de envío

### Requirement 3: Persistencia de la Sesión y Ciclo de Vida

**User Story:** Como usuario, quiero que mi sesión de datos en tiempo real se mantenga activa mientras uso la aplicación y se cierre de forma segura cuando me desconecto, para garantizar una experiencia fluida y un uso eficiente de los recursos.

#### Acceptance Criteria

1. WHEN la conexión MQTT es establecida THEN SHALL mantenerse activa durante toda la sesión del usuario en la aplicación
2. WHEN se pierde la conexión de red de forma inesperada THEN el cliente MQTT SHALL intentar reconectarse automáticamente con una estrategia de backoff exponencial
3. WHEN el usuario cierra sesión explícitamente THEN el sistema SHALL desconectar limpiamente el cliente MQTT y liberar todos los recursos asociados
4. WHEN el token de autenticación del usuario expira THEN la conexión MQTT SHALL ser terminada
5. WHEN el componente principal (wrapper) de la aplicación se desmonte THEN se SHALL asegurar la desconexión del cliente para evitar fugas de memoria

### Requirement 4: Encapsulación de Lógica en un Custom Hook (useMqtt)

**User Story:** Como desarrollador, quiero un Custom Hook (useMqtt) que encapsule toda la lógica de conexión, suscripción y publicación de MQTT, para mantener el código limpio, modular y fácil de reutilizar en toda la aplicación.

#### Acceptance Criteria

1. WHEN se implemente el hook useMqtt THEN este SHALL gestionar el ciclo de vida completo del cliente MQTT (inicialización, conexión, manejo de eventos, desconexión)
2. WHEN se utilice el hook THEN SHALL exponer el estado actual de la conexión (connectionStatus), el cliente MQTT (client), y funciones para suscribirse (subscribe) y publicar (publish)
3. WHEN el hook se inicialice THEN SHALL recibir la configuración de conexión (URL, opciones de autenticación, propiedades de MQTT 5.0) como parámetros
4. WHEN se produzca un error en el cliente MQTT THEN el hook SHALL capturarlo y exponerlo en su estado para que la UI pueda reaccionar
5. WHEN el componente que usa el hook se desmonte THEN el efecto de limpieza (useEffect cleanup) SHALL garantizar que el cliente se desconecte correctamente

### Requirement 5: Publicación de Mensajes mediante Server Actions

**User Story:** Como desarrollador, quiero utilizar Server Actions para publicar mensajes MQTT, para centralizar la lógica de negocio en el servidor y mejorar la seguridad al no exponer la lógica de publicación en el cliente.

#### Acceptance Criteria

1. WHEN una interacción del usuario requiera enviar datos (ej. enviar un formulario) THEN SHALL invocar un Server Action específico
2. WHEN se ejecuta el Server Action THEN este SHALL tener acceso a la instancia del cliente MQTT para publicar el mensaje en el tópico correspondiente
3. WHEN se publica un mensaje THEN el Server Action SHALL poder añadir propiedades de MQTT 5.0, como responseTopic o userProperties, para interacciones avanzadas
4. WHEN la publicación falle (ej. cliente no conectado) THEN el Server Action SHALL manejar el error y retornar un estado de fracaso al componente que lo invocó
5. WHEN se define un Server Action THEN SHALL seguir las convenciones de Next.js, ubicándose en un archivo actions.ts o co-ubicado con el componente que lo usa

### Requirement 6: Manejo de Errores y Monitoreo

**User Story:** Como administrador del sistema, quiero que todos los eventos críticos y errores del cliente MQTT sean registrados, para poder monitorear la salud del sistema en tiempo real y diagnosticar problemas de manera eficiente.

#### Acceptance Criteria

1. WHEN el cliente falle al conectar THEN el sistema SHALL registrar un log de error detallado (excluyendo datos sensibles como la contraseña)
2. WHEN el cliente se desconecte de manera inesperada THEN el sistema SHALL registrar el evento, incluyendo la razón si está disponible
3. WHEN una publicación de mensaje falle THEN el sistema SHALL registrar el error, el tópico y el payload del mensaje (si las políticas de seguridad lo permiten)
4. WHEN se reciba un mensaje entrante que no pueda ser procesado (ej. JSON malformado) THEN el sistema SHALL registrar el error y el mensaje crudo para su posterior análisis
5. WHEN el cliente se reconecte exitosamente después de una falla THEN el sistema SHALL registrar un log informativo del evento