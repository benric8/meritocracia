-- =============================================================================
-- CARGA INICIAL DE DATOS — MERITOCRACIA
-- Fuente: RF005 / RF006 / RF007 + mockups de ficha y reportes
-- Ejecutar DESPUÉS de bdmeritocracia.sql
-- Schema: meritocracia
--
-- Incluye:
--   - Niveles, especialidades, idiomas, colegios de abogados, universidades
--   - Rubros A–J y subrubros E.1–E.6
--   - Criterios de desempate (Cuadro Antigüedad / Cuadro Méritos)
--   - Listas / valores para combos de la ficha
--   - Reglas de puntaje base (validar contra R.A.031-2013-CE-PJ)
-- =============================================================================

SET search_path TO meritocracia, public;

-- -----------------------------------------------------------------------------
-- 1. mae_nivel
-- -----------------------------------------------------------------------------
INSERT INTO mae_nivel (n_nivel_id, c_nivel, x_nombre, n_orden, l_activo, b_aud)
VALUES
    (1, 'SUPREMO',       'Juez Supremo Titular',       1, '1', 'I'),
    (2, 'SUPERIOR',      'Juez Superior Titular',      2, '1', 'I'),
    (3, 'ESPECIALIZADO', 'Juez Especializado Titular', 3, '1', 'I'),
    (4, 'PAZ_LETRADO',   'Juez de Paz Letrado',        4, '1', 'I');

SELECT setval('useq_mae_nivel', (SELECT COALESCE(MAX(n_nivel_id), 1) FROM mae_nivel));

-- -----------------------------------------------------------------------------
-- 2. mae_especialidad (laboral / jurisdiccional)
-- -----------------------------------------------------------------------------
INSERT INTO mae_especialidad (n_especialidad_id, c_especialidad, x_nombre, n_orden, l_activo, b_aud)
VALUES
    (1,  'CIVIL',           'Civil',                          1,  '1', 'I'),
    (2,  'PENAL',           'Penal',                          2,  '1', 'I'),
    (3,  'LABORAL',         'Laboral',                        3,  '1', 'I'),
    (4,  'FAMILIA',         'Familia',                        4,  '1', 'I'),
    (5,  'CONSTITUCIONAL',  'Constitucional',                 5,  '1', 'I'),
    (6,  'CONTENCIOSO',     'Contencioso Administrativo',     6,  '1', 'I'),
    (7,  'COMERCIAL',       'Comercial',                      7,  '1', 'I'),
    (8,  'MIXTO',           'Mixto',                          8,  '1', 'I'),
    (9,  'PENAL_LIQUIDA',   'Penal Liquidador',               9,  '1', 'I'),
    (10, 'OTROS',           'Otros',                         10,  '1', 'I');

SELECT setval('useq_mae_especialidad', (SELECT COALESCE(MAX(n_especialidad_id), 1) FROM mae_especialidad));

-- -----------------------------------------------------------------------------
-- 3. mae_idioma
-- -----------------------------------------------------------------------------
INSERT INTO mae_idioma (n_idioma_id, x_nombre, c_tipo, l_activo, b_aud)
VALUES
    (1,  'Quechua',     'NATIVO',     '1', 'I'),
    (2,  'Aimara',      'NATIVO',     '1', 'I'),
    (3,  'Asháninka',   'NATIVO',     '1', 'I'),
    (4,  'Shipibo',     'NATIVO',     '1', 'I'),
    (5,  'Inglés',      'EXTRANJERO', '1', 'I'),
    (6,  'Francés',     'EXTRANJERO', '1', 'I'),
    (7,  'Alemán',      'EXTRANJERO', '1', 'I'),
    (8,  'Italiano',    'EXTRANJERO', '1', 'I'),
    (9,  'Portugués',   'EXTRANJERO', '1', 'I'),
    (10, 'Chino',       'EXTRANJERO', '1', 'I'),
    (11, 'Japonés',     'EXTRANJERO', '1', 'I'),
    (12, 'Otro',        'EXTRANJERO', '1', 'I');

SELECT setval('useq_mae_idioma', (SELECT COALESCE(MAX(n_idioma_id), 1) FROM mae_idioma));

-- -----------------------------------------------------------------------------
-- 4. mae_colegio_abogado
-- -----------------------------------------------------------------------------
INSERT INTO mae_colegio_abogado (n_colegio_abog_id, x_nombre, c_sigla, l_activo, b_aud)
VALUES
    (1,  'Colegio de Abogados de Lima',              'CAL',   '1', 'I'),
    (2,  'Colegio de Abogados de Lima Norte',        'CALN',  '1', 'I'),
    (3,  'Colegio de Abogados de Arequipa',          'CAA',   '1', 'I'),
    (4,  'Colegio de Abogados de La Libertad',       'CALL',  '1', 'I'),
    (5,  'Colegio de Abogados de Junín',             'CAJ',   '1', 'I'),
    (6,  'Colegio de Abogados del Callao',           'CAC',   '1', 'I'),
    (7,  'Colegio de Abogados de Cusco',             'CACU',  '1', 'I'),
    (8,  'Colegio de Abogados de Piura',             'CAP',   '1', 'I'),
    (9,  'Colegio de Abogados de Lambayeque',        'CALA',  '1', 'I'),
    (10, 'Colegio de Abogados de Huancavelica',      'CAH',   '1', 'I'),
    (11, 'Colegio de Abogados de Amazonas',          'CAAM',  '1', 'I'),
    (12, 'Colegio de Abogados de Puno',              'CAPU',  '1', 'I'),
    (13, 'Otros colegios de abogados del Perú',     'OTROS', '1', 'I');

SELECT setval('useq_mae_colegio_abogado', (SELECT COALESCE(MAX(n_colegio_abog_id), 1) FROM mae_colegio_abogado));

-- -----------------------------------------------------------------------------
-- 5. mae_universidad (muestra inicial; ampliar según catálogo institucional)
--     n_pais_id: usa el Perú de mae_pais si existe; si no, queda NULL
-- -----------------------------------------------------------------------------
INSERT INTO mae_universidad (n_universidad_id, x_nombre, c_codigo, n_pais_id, l_activo, b_aud)
SELECT v.n_universidad_id,
       v.x_nombre,
       v.c_codigo,
       (SELECT n_pais_id
          FROM mae_pais
         WHERE l_activo = '1'
           AND UPPER(x_pais) LIKE '%PER%'
         ORDER BY n_pais_id
         LIMIT 1),
       '1',
       'I'
FROM (
    VALUES
        (1,  'Pontificia Universidad Católica del Perú', 'PUCP'),
        (2,  'Universidad Nacional Mayor de San Marcos', 'UNMSM'),
        (3,  'Universidad de Lima',                      'ULIMA'),
        (4,  'Universidad Nacional de San Agustín',      'UNSA'),
        (5,  'Universidad Nacional de Trujillo',         'UNT'),
        (6,  'Universidad Nacional del Altiplano',       'UNA'),
        (7,  'Universidad San Martín de Porres',         'USMP'),
        (8,  'Universidad ESAN',                         'ESAN'),
        (9,  'Universidad del Pacífico',                 'UP'),
        (10, 'Universidad Nacional de Ingeniería',       'UNI'),
        (11, 'Universidad Ricardo Palma',                'URP'),
        (12, 'Universidad Católica de Santa María',      'UCSM'),
        (13, 'Universidad Nacional Federico Villarreal', 'UNFV'),
        (14, 'Universidad César Vallejo',                'UCV'),
        (15, 'Otra universidad nacional o extranjera',   'OTRA')
) AS v(n_universidad_id, x_nombre, c_codigo);

SELECT setval('useq_mae_universidad', (SELECT COALESCE(MAX(n_universidad_id), 1) FROM mae_universidad));
-- -----------------------------------------------------------------------------
-- 6. mae_rubro (A–J según ficha de valoración / Anexo 2)
-- -----------------------------------------------------------------------------
INSERT INTO mae_rubro (
    n_rubro_id, c_rubro, x_nombre, n_orden, n_puntaje_max, n_anios_vigencia,
    l_suspendido, l_permite_negativo, l_excluye_desemp_meritos, l_activo, b_aud
)
VALUES
    (1,  'A', 'Producción jurisdiccional',                                      1,  NULL, NULL, '1', '0', '0', '1', 'I'), -- suspendido R.A.031-2013-CE-PJ
    (2,  'B', 'Antigüedad en el cargo',                                          2,  NULL, NULL, '0', '0', '1', '1', 'I'), -- excluida del 1.er criterio Cuadro Méritos
    (3,  'C', 'Grados académicos y títulos profesionales',                      3,  NULL, NULL, '0', '0', '0', '1', 'I'),
    (4,  'D', 'Estudios de preparación AMAG',                                   4,  NULL, NULL, '0', '0', '0', '1', 'I'),
    (5,  'E', 'Estudios de perfeccionamiento',                                  5,  NULL, NULL, '0', '0', '0', '1', 'I'),
    (6,  'F', 'Idioma nativo o extranjero',                                     6,  NULL, NULL, '0', '0', '0', '1', 'I'),
    (7,  'G', 'Publicaciones de índole jurídico',                               7,  NULL,    5, '0', '0', '0', '1', 'I'), -- artículos: 5 años; libros sin vigencia en app
    (8,  'H', 'Distinciones y condecoraciones',                                 8,  NULL,    7, '0', '0', '0', '1', 'I'), -- acreditación sin sanciones: 7 años
    (9,  'I', 'Docencia universitaria',                                         9,  NULL,    7, '0', '0', '0', '1', 'I'),
    (10, 'J', 'Deméritos',                                                     10,  NULL, NULL, '0', '1', '0', '1', 'I');

SELECT setval('useq_mae_rubro', (SELECT COALESCE(MAX(n_rubro_id), 1) FROM mae_rubro));

-- -----------------------------------------------------------------------------
-- 7. mae_subrubro (E.1–E.6)
-- -----------------------------------------------------------------------------
INSERT INTO mae_subrubro (
    n_subrubro_id, n_rubro_id, c_subrubro, x_nombre, n_orden,
    n_puntaje_max, n_anios_vigencia, l_activo, b_aud
)
VALUES
    (1, 5, 'E1', 'Estudios de doctorado y/o maestría',                                              1, NULL, NULL, '1', 'I'),
    (2, 5, 'E2', 'Pasantía',                                                                        2, NULL,    5, '1', 'I'),
    (3, 5, 'E3', 'Cursos de especialización, postgrado y diplomados',                               3, NULL,    5, '1', 'I'),
    (4, 5, 'E4', 'Certámenes académicos en calidad de expositor, ponente o panelista',              4, NULL,    5, '1', 'I'),
    (5, 5, 'E5', 'Asistencia a eventos académicos en entidades de prestigio y del quehacer jurídico', 5, NULL, 5, '1', 'I'),
    (6, 5, 'E6', 'Estudios de ofimática',                                                           6, NULL, NULL, '1', 'I');

SELECT setval('useq_mae_subrubro', (SELECT COALESCE(MAX(n_subrubro_id), 1) FROM mae_subrubro));

-- -----------------------------------------------------------------------------
-- 8. mae_criterio_desempate (RF005)
-- -----------------------------------------------------------------------------
INSERT INTO mae_criterio_desempate (
    n_criterio_desemp_id, c_cuadro, c_nivel, n_orden, c_codigo, x_nombre, c_sentido, l_activo, b_aud
)
VALUES
    -- Cuadro de Antigüedad
    (1, 'ANTIGUEDAD', NULL, 1, 'CARGO_ANTERIOR',
        'Mayor periodo laborado como Juez en el nivel inmediato anterior titular', 'DESC', '1', 'I'),
    (2, 'ANTIGUEDAD', NULL, 2, 'PROVISIONALIDAD',
        'Mayor periodo desempeñado como Juez en el nivel titular actual (provisionalidades)', 'DESC', '1', 'I'),
    (3, 'ANTIGUEDAD', NULL, 3, 'COLEGIATURA',
        'Mayor antigüedad de colegiatura a la fecha de valoración', 'DESC', '1', 'I'),
    (4, 'ANTIGUEDAD', NULL, 4, 'HORA_JURAMENTO',
        'Menor hora de juramentación en el cargo titular actual valorado', 'ASC', '1', 'I'),
    -- Cuadro de Méritos
    (5, 'MERITOS', NULL, 1, 'PUNTAJE_SIN_ANTIG',
        'Mayor puntaje total excluyendo antigüedad en el cargo', 'DESC', '1', 'I'),
    (6, 'MERITOS', NULL, 2, 'DEMERITOS',
        'Menor puntaje negativo de deméritos (de menor a mayor en valor absoluto negativo)', 'ASC', '1', 'I'),
    (7, 'MERITOS', NULL, 3, 'POS_ANTIGUEDAD',
        'Mejor posición en el Cuadro de Antigüedad', 'ASC', '1', 'I');

SELECT setval('useq_mae_criterio_desempate', (SELECT COALESCE(MAX(n_criterio_desemp_id), 1) FROM mae_criterio_desempate));

-- -----------------------------------------------------------------------------
-- 9. mae_lista + mae_lista_valor (combos de ficha / asignación)
-- -----------------------------------------------------------------------------
INSERT INTO mae_lista (n_lista_id, c_lista, x_nombre, l_activo, b_aud)
VALUES
    (1,  'SEXO',                 'Sexo',                                         '1', 'I'),
    (2,  'TIPO_AMAG',            'Tipo de curso AMAG',                            '1', 'I'),
    (3,  'TIPO_GRADO',           'Nivel de grado / título profesional',           '1', 'I'),
    (4,  'TIPO_ESTUDIO_POS',     'Tipo de estudio doctorado / maestría (E.1)',    '1', 'I'),
    (5,  'ORDEN_JURIDICO',       'Orden jurídico / no jurídico',                  '1', 'I'),
    (6,  'CONDICION_ACADEMICA',  'Condición académica',                           '1', 'I'),
    (7,  'TIPO_PASANTIA',        'Tipo de pasantía',                              '1', 'I'),
    (8,  'SI_NO',                'Sí / No',                                       '1', 'I'),
    (9,  'TIPO_CERTAMEN',        'Tipo de certamen / evento académico',           '1', 'I'),
    (10, 'TIPO_PARTICIPACION',   'Tipo de participación en certamen',             '1', 'I'),
    (11, 'MODALIDAD',            'Modalidad de evento',                           '1', 'I'),
    (12, 'TIPO_DOCUMENTO',       'Tipo de documento acreditativo',                '1', 'I'),
    (13, 'NIVEL_CURSO',          'Nivel de curso (ofimática / idioma)',           '1', 'I'),
    (14, 'TIPO_IDIOMA',          'Tipo de idioma',                                '1', 'I'),
    (15, 'TIPO_PUBLICACION',     'Tipo de publicación',                           '1', 'I'),
    (16, 'TIPO_DISTINCION',      'Tipo de distinción / condecoración',            '1', 'I'),
    (17, 'TIPO_DEMERITO',        'Tipo de medida disciplinaria (demérito)',       '1', 'I'),
    (18, 'OBS_ASIGNACION',       'Observación de asignación de registrador',      '1', 'I'),
    (19, 'CARGO_PROVISIONAL',    'Cargo en provisionalidad',                      '1', 'I'),
    (20, 'ESTADO_FICHA',         'Estado de ficha / consulta de méritos',         '1', 'I'),
    (21, 'ESTADO_VIGENCIA',      'Estado de vigencia documental',                 '1', 'I');

SELECT setval('useq_mae_lista', (SELECT COALESCE(MAX(n_lista_id), 1) FROM mae_lista));

INSERT INTO mae_lista_valor (n_lista_valor_id, n_lista_id, c_valor, x_descripcion, n_orden, n_valor_num, l_activo, b_aud)
VALUES
    -- SEXO
    (1,  1, 'M', 'Masculino', 1, NULL, '1', 'I'),
    (2,  1, 'F', 'Femenino',  2, NULL, '1', 'I'),

    -- TIPO_AMAG
    (3,  2, 'HABILITANTE', 'Habilitante', 1, NULL, '1', 'I'),
    (4,  2, 'PROFA',       'PROFA',       2, NULL, '1', 'I'),
    (5,  2, 'ASCENSO',     'Ascenso',     3, NULL, '1', 'I'),

    -- TIPO_GRADO
    (6,  3, 'DOCTORADO',     'Doctorado',     1, NULL, '1', 'I'),
    (7,  3, 'MAESTRIA',      'Maestría',      2, NULL, '1', 'I'),
    (8,  3, 'LICENCIATURA',  'Licenciatura',  3, NULL, '1', 'I'),
    (9,  3, 'BACHILLER',     'Bachiller',     4, NULL, '1', 'I'),

    -- TIPO_ESTUDIO_POS
    (10, 4, 'DOCTORADO', 'Doctorado', 1, NULL, '1', 'I'),
    (11, 4, 'MAESTRIA',  'Maestría',  2, NULL, '1', 'I'),

    -- ORDEN_JURIDICO
    (12, 5, 'JURIDICO',    'Jurídico',    1, NULL, '1', 'I'),
    (13, 5, 'NO_JURIDICO', 'No jurídico', 2, NULL, '1', 'I'),

    -- CONDICION_ACADEMICA
    (14, 6, 'ESTUDIANTE', 'Estudiante', 1, NULL, '1', 'I'),
    (15, 6, 'EGRESADO',   'Egresado',   2, NULL, '1', 'I'),

    -- TIPO_PASANTIA
    (16, 7, 'NACIONAL',      'Nacional',      1, NULL, '1', 'I'),
    (17, 7, 'INTERNACIONAL', 'Internacional', 2, NULL, '1', 'I'),

    -- SI_NO
    (18, 8, '1', 'Sí', 1, NULL, '1', 'I'),
    (19, 8, '0', 'No', 2, NULL, '1', 'I'),

    -- TIPO_CERTAMEN
    (20, 9, 'COLOQUIO',      'COLOQUIO',      1,  NULL, '1', 'I'),
    (21, 9, 'CONFERENCIA',   'CONFERENCIA',   2,  NULL, '1', 'I'),
    (22, 9, 'CONGRESO',      'CONGRESO',      3,  NULL, '1', 'I'),
    (23, 9, 'CURSOS',        'CURSOS',        4,  NULL, '1', 'I'),
    (24, 9, 'ENCUENTRO',     'ENCUENTRO',     5,  NULL, '1', 'I'),
    (25, 9, 'FORO',          'FORO',          6,  NULL, '1', 'I'),
    (26, 9, 'JORNADA',       'JORNADA',       7,  NULL, '1', 'I'),
    (27, 9, 'MESA_REDONDA',  'MESA REDONDA',  8,  NULL, '1', 'I'),
    (28, 9, 'PANEL',         'PANEL',         9,  NULL, '1', 'I'),
    (29, 9, 'SEMANA',        'SEMANA',       10,  NULL, '1', 'I'),
    (30, 9, 'SEMINARIO',     'SEMINARIO',    11,  NULL, '1', 'I'),
    (31, 9, 'SIMPOSIO',      'SIMPOSIO',     12,  NULL, '1', 'I'),
    (32, 9, 'TALLER',        'TALLER',       13,  NULL, '1', 'I'),
    (33, 9, 'OTROS',         'OTROS',        14,  NULL, '1', 'I'),

    -- TIPO_PARTICIPACION
    (34, 10, 'EXPOSITOR', 'Expositor', 1, NULL, '1', 'I'),
    (35, 10, 'PONENTE',   'Ponente',   2, NULL, '1', 'I'),
    (36, 10, 'PANELISTA', 'Panelista', 3, NULL, '1', 'I'),

    -- MODALIDAD
    (37, 11, 'PRESENCIAL',      'PRESENCIAL',       1, NULL, '1', 'I'),
    (38, 11, 'VIRTUAL',         'VIRTUAL',          2, NULL, '1', 'I'),
    (39, 11, 'SEMI_PRESENCIAL', 'SEMI PRESENCIAL',  3, NULL, '1', 'I'),

    -- TIPO_DOCUMENTO
    (40, 12, 'CARTA',               'CARTA',               1, NULL, '1', 'I'),
    (41, 12, 'CERTIFICADO',         'CERTIFICADO',         2, NULL, '1', 'I'),
    (42, 12, 'CONSTANCIA',          'CONSTANCIA',          3, NULL, '1', 'I'),
    (43, 12, 'CONTRATO',            'CONTRATO',            4, NULL, '1', 'I'),
    (44, 12, 'DECLARACION_JURADA',  'DECLARACION JURADA',  5, NULL, '1', 'I'),
    (45, 12, 'OFICIO',              'OFICIO',              6, NULL, '1', 'I'),
    (46, 12, 'REPORTE',             'REPORTE',             7, NULL, '1', 'I'),
    (47, 12, 'OTROS',               'OTROS',               8, NULL, '1', 'I'),

    -- NIVEL_CURSO
    (48, 13, 'BASICO',      'Básico',      1, NULL, '1', 'I'),
    (49, 13, 'INTERMEDIO',  'Intermedio',  2, NULL, '1', 'I'),
    (50, 13, 'AVANZADO',    'Avanzado',    3, NULL, '1', 'I'),

    -- TIPO_IDIOMA
    (51, 14, 'NATIVO',     'Nativo',     1, NULL, '1', 'I'),
    (52, 14, 'EXTRANJERO', 'Extranjero', 2, NULL, '1', 'I'),

    -- TIPO_PUBLICACION
    (53, 15, 'LIBRO',    'Libro',    1, NULL, '1', 'I'),
    (54, 15, 'ARTICULO', 'Artículo', 2, NULL, '1', 'I'),

    -- TIPO_DISTINCION
    (55, 16, 'QUEHACER_JURISDICCIONAL',
        'Importante por el quehacer jurisdiccional, otorgado por órgano colegiado mediante resolución y en reconocimiento a su quehacer judicial',
        1, NULL, '1', 'I'),
    (56, 16, 'ELECCION_DESIGNACION',
        'Elección de Presidente de Corte, Consejero, Designaciones ante la AMAG, Jefe de ODECMA',
        2, NULL, '1', 'I'),
    (57, 16, 'RESPONSABLE_ODECMA',
        'Responsable de Unidad de ODECMA',
        3, NULL, '1', 'I'),
    (58, 16, 'SIN_SANCIONES_7A',
        'Acreditación de no contar con sanciones disciplinarias en los últimos 07 años (emitido por el CNM / OCMA / ODECMA)',
        4, NULL, '1', 'I'),

    -- TIPO_DEMERITO
    (59, 17, 'AMONESTACION', 'Amonestación', 1, NULL, '1', 'I'),
    (60, 17, 'MULTA',        'Multa',        2, NULL, '1', 'I'),
    (61, 17, 'SUSPENSION',   'Suspensión',   3, NULL, '1', 'I'),

    -- OBS_ASIGNACION
    (62, 18, 'LICENCIA',          'Licencia',           1, NULL, '1', 'I'),
    (63, 18, 'VACACIONES',        'Vacaciones',         2, NULL, '1', 'I'),
    (64, 18, 'DESCANSO_MEDICO',   'Descanso médico',    3, NULL, '1', 'I'),
    (65, 18, 'PERMISO_PERSONAL',  'Permiso personal',   4, NULL, '1', 'I'),

    -- CARGO_PROVISIONAL
    (66, 19, 'JUEZ_SUPREMO',       'JUEZ SUPREMO',       1, NULL, '1', 'I'),
    (67, 19, 'JUEZ_SUPERIOR',      'JUEZ SUPERIOR',      2, NULL, '1', 'I'),
    (68, 19, 'JUEZ_ESPECIALIZADO', 'JUEZ ESPECIALIZADO', 3, NULL, '1', 'I'),

    -- ESTADO_FICHA
    (69, 20, 'ACTIVO',   'Activo',   1, NULL, '1', 'I'),
    (70, 20, 'INACTIVO', 'Inactivo', 2, NULL, '1', 'I'),

    -- ESTADO_VIGENCIA
    (71, 21, 'VIGENTE',  'Vigente',           1, NULL, '1', 'I'),
    (72, 21, 'PROXIMO',  'Próximo a caducar', 2, NULL, '1', 'I'),
    (73, 21, 'CADUCADO', 'Caducado',          3, NULL, '1', 'I');

SELECT setval('useq_mae_lista_valor', (SELECT COALESCE(MAX(n_lista_valor_id), 1) FROM mae_lista_valor));

-- -----------------------------------------------------------------------------
-- 10. mae_regla_puntaje
--     Claves base para el motor de cálculo. Los puntajes deben contrastarse
--     con la Tabla de Puntajes de la R.A.031-2013-CE-PJ antes de producción.
--     Valores de ejemplo tomados de mockups / criterios RF cuando constan.
-- -----------------------------------------------------------------------------
INSERT INTO mae_regla_puntaje (
    n_regla_puntaje_id, n_rubro_id, n_subrubro_id, c_clave, x_descripcion, x_condicion,
    n_puntaje, n_puntaje_min, n_puntaje_max, n_anio_desde, n_anio_hasta, n_orden, l_activo, b_aud
)
VALUES
    -- Rubro B — Antigüedad (tramos referenciales; ajustar a tabla oficial)
    (1,  2, NULL, 'ANTIG_ANIO', 'Puntaje por año de antigüedad en cargo titular', 'Por año completo de antigüedad',
        1.500, NULL, NULL, NULL, NULL, 1, '1', 'I'),

    -- Rubro C — Grados
    (2,  3, NULL, 'GRADO_DOCTORADO',    'Doctorado',    'Título de doctor',     8.000, NULL, NULL, NULL, NULL, 1, '1', 'I'),
    (3,  3, NULL, 'GRADO_MAESTRIA',     'Maestría',     'Título de magíster',   5.000, NULL, NULL, NULL, NULL, 2, '1', 'I'),
    (4,  3, NULL, 'GRADO_LICENCIATURA', 'Licenciatura', 'Título profesional',   2.000, NULL, NULL, NULL, NULL, 3, '1', 'I'),
    (5,  3, NULL, 'GRADO_BACHILLER',    'Bachiller',    'Grado de bachiller',   1.000, NULL, NULL, NULL, NULL, 4, '1', 'I'),

    -- Rubro D — AMAG (ejemplo mockup: Habilitante 8.00)
    (6,  4, NULL, 'AMAG_HABILITANTE', 'Curso habilitante AMAG', 'Tipo Habilitante', 8.000, NULL, NULL, NULL, NULL, 1, '1', 'I'),
    (7,  4, NULL, 'AMAG_PROFA',       'Curso PROFA AMAG',       'Tipo PROFA',       6.000, NULL, NULL, NULL, NULL, 2, '1', 'I'),
    (8,  4, NULL, 'AMAG_ASCENSO',     'Curso de ascenso AMAG',  'Tipo Ascenso',     4.000, NULL, NULL, NULL, NULL, 3, '1', 'I'),

    -- Rubro E — subrubros (claves estructurales; puntaje 0 = definir con tabla oficial)
    (9,  5, 1, 'E1_DOCTORADO',       'Estudios de doctorado en curso / egresado', 'E.1 Doctorado',  0.000, 0, 10, NULL, NULL, 1, '1', 'I'),
    (10, 5, 1, 'E1_MAESTRIA',        'Estudios de maestría en curso / egresado',  'E.1 Maestría',   0.000, 0,  8, NULL, NULL, 2, '1', 'I'),
    (11, 5, 2, 'E2_PASANTIA_NAC',    'Pasantía nacional',                         'E.2 Nacional',   0.000, 0,  5, NULL, NULL, 1, '1', 'I'),
    (12, 5, 2, 'E2_PASANTIA_INT',    'Pasantía internacional',                    'E.2 Internac.',  0.000, 0,  5, NULL, NULL, 2, '1', 'I'),
    (13, 5, 3, 'E3_CURSO_ESPEC',     'Curso de especialización / diplomado',      'E.3 según horas',0.000, 0, 10, NULL, NULL, 1, '1', 'I'),
    (14, 5, 4, 'E4_CERTAMEN',        'Participación como expositor/ponente/panelista', 'E.4',       0.000, 0,  5, NULL, NULL, 1, '1', 'I'),
    (15, 5, 5, 'E5_ASISTENCIA',      'Asistencia a evento académico',             'E.5',           0.000, 0,  3, NULL, NULL, 1, '1', 'I'),
    (16, 5, 6, 'E6_OFIMATICA',       'Estudios de ofimática',                     'E.6',           0.000, 0,  2, NULL, NULL, 1, '1', 'I'),

    -- Rubro F — Idiomas
    (17, 6, NULL, 'IDIOMA_NATIVO',     'Idioma nativo',     'Tipo Nativo',     0.000, 0, 5, NULL, NULL, 1, '1', 'I'),
    (18, 6, NULL, 'IDIOMA_EXTRANJERO', 'Idioma extranjero', 'Tipo Extranjero', 0.000, 0, 5, NULL, NULL, 2, '1', 'I'),

    -- Rubro G — Publicaciones
    (19, 7, NULL, 'PUB_LIBRO',    'Publicación tipo libro',    'Libro',    0.000, 0, 10, NULL, NULL, 1, '1', 'I'),
    (20, 7, NULL, 'PUB_ARTICULO', 'Publicación tipo artículo', 'Artículo', 0.000, 0,  5, NULL, NULL, 2, '1', 'I'),

    -- Rubro H — Distinciones
    (21, 8, NULL, 'DIST_QUEHACER',      'Distinción por quehacer jurisdiccional', 'Tipo 1', 0.000, 0, 5, NULL, NULL, 1, '1', 'I'),
    (22, 8, NULL, 'DIST_ELECCION',      'Elección / designación institucional',   'Tipo 2', 0.000, 0, 5, NULL, NULL, 2, '1', 'I'),
    (23, 8, NULL, 'DIST_ODECMA',        'Responsable de Unidad de ODECMA',        'Tipo 3', 0.000, 0, 3, NULL, NULL, 3, '1', 'I'),
    (24, 8, NULL, 'DIST_SIN_SANCIONES', 'Acreditación sin sanciones (7 años)',    'Tipo 4', 0.000, 0, 3, NULL, NULL, 4, '1', 'I'),

    -- Rubro I — Docencia
    (25, 9, NULL, 'DOCENCIA_UNIV', 'Docencia universitaria', 'Por periodo / horas', 0.000, 0, 15, NULL, NULL, 1, '1', 'I'),

    -- Rubro J — Deméritos (ejemplo mockup: Amonestación -2.00)
    (26, 10, NULL, 'DEM_AMONESTACION', 'Demérito por amonestación', 'Medida Amonestación', -2.000, NULL, NULL, NULL, NULL, 1, '1', 'I'),
    (27, 10, NULL, 'DEM_MULTA',        'Demérito por multa',        'Medida Multa',        -3.000, NULL, NULL, NULL, NULL, 2, '1', 'I'),
    (28, 10, NULL, 'DEM_SUSPENSION',   'Demérito por suspensión',   'Medida Suspensión',   -5.000, NULL, NULL, NULL, NULL, 3, '1', 'I');

SELECT setval('useq_mae_regla_puntaje', (SELECT COALESCE(MAX(n_regla_puntaje_id), 1) FROM mae_regla_puntaje));

-- =============================================================================
-- FIN CARGA INICIAL
-- Notas:
-- 1) Distritos judiciales (mae_distrito_judicial) y países (mae_pais) se asumen
--    cargados desde el entorno / SIGA o scripts previos.
-- 2) Perfiles, opciones de menú y usuarios pertenecen al módulo de seguridad
--    ya modelado; no se incluyen aquí.
-- 3) Ajustar n_puntaje_* de mae_regla_puntaje con la Tabla oficial de Puntajes
--    (R.A.031-2013-CE-PJ) antes de usar en cálculo productivo.
-- =============================================================================
