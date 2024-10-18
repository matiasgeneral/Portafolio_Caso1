CREATE TABLE `usuarios` (
  `uid` varchar(255) PRIMARY KEY,
  `nombre` varchar(255),
  `apellidoPaterno` varchar(255),
  `apellidoMaterno` varchar(255),
  `direccion` varchar(255),
  `documento` varchar(255),
  `foto` varchar(255),
  `email` varchar(255),
  `telefono` varchar(255),
  `estado` varchar(255),
  `rol` varchar(255)
);

CREATE TABLE `actividades` (
  `id` varchar(255) PRIMARY KEY,
  `titulo` varchar(255),
  `descripcion` varchar(255),
  `fechaCreacion` date,
  `fechaEvento` date,
  `cantidadMax` int,
  `cantidadDisponible` int
);

CREATE TABLE `participantes` (
  `uid` varchar(255),
  `actividadId` varchar(255),
  `nombre` varchar(255),
  `fechaInscripcion` date,
  `cantidadParticipantes` int
);

CREATE TABLE `espaciosPublicos` (
  `id` varchar(255) PRIMARY KEY,
  `titulo` varchar(255),
  `descripcion` varchar(255),
  `ubicacion` varchar(255),
  `fechaCreacion` date,
  `image` varchar(255)
);

CREATE TABLE `fechasReservadas` (
  `id` varchar(255) PRIMARY KEY,
  `fecha` date,
  `horaInicio` time,
  `horaFin` time,
  `solicitanteUid` varchar(255),
  `fechaSolicitud` date,
  `espacioPublicoId` varchar(255)
);

CREATE TABLE `noticias` (
  `id` varchar(255) PRIMARY KEY,
  `title` varchar(255),
  `subtitle` varchar(255),
  `details` varchar(255),
  `date` date,
  `image` varchar(255)
);

CREATE TABLE `proyectos` (
  `id` varchar(255) PRIMARY KEY,
  `titulo` varchar(255),
  `descripcion` varchar(255),
  `fechaCreacion` date,
  `fechaInicio` date,
  `fechaFin` date,
  `estado` varchar(255),
  `maxPostulantes` int,
  `minPostulantes` int
);

CREATE TABLE `documentosRequeridos` (
  `id` varchar(255) PRIMARY KEY,
  `nombre` varchar(255),
  `tipo` varchar(255),
  `proyectoId` varchar(255)
);

CREATE TABLE `postulantes` (
  `uid` varchar(255),
  `proyectoId` varchar(255),
  `nombre` varchar(255)
);

CREATE TABLE `documentosSubidos` (
  `documentoId` varchar(255),
  `nombre` varchar(255),
  `tipo` varchar(255),
  `url` varchar(255),
  `postulanteUid` varchar(255)
);

ALTER TABLE `actividades` ADD FOREIGN KEY (`id`) REFERENCES `participantes` (`actividadId`);

ALTER TABLE `usuarios` ADD FOREIGN KEY (`uid`) REFERENCES `participantes` (`uid`);

ALTER TABLE `usuarios` ADD FOREIGN KEY (`uid`) REFERENCES `fechasReservadas` (`solicitanteUid`);

ALTER TABLE `espaciosPublicos` ADD FOREIGN KEY (`id`) REFERENCES `fechasReservadas` (`espacioPublicoId`);

ALTER TABLE `proyectos` ADD FOREIGN KEY (`id`) REFERENCES `documentosRequeridos` (`proyectoId`);

ALTER TABLE `proyectos` ADD FOREIGN KEY (`id`) REFERENCES `postulantes` (`proyectoId`);

ALTER TABLE `usuarios` ADD FOREIGN KEY (`uid`) REFERENCES `postulantes` (`uid`);

ALTER TABLE `postulantes` ADD FOREIGN KEY (`uid`) REFERENCES `documentosSubidos` (`postulanteUid`);
