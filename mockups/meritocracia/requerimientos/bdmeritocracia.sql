create sequence useq_mae_distrito_judicial;

alter sequence useq_mae_distrito_judicial owner to "usrMeritocracia";

grant select, usage on sequence useq_mae_distrito_judicial to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_distrito_judicial to uc_meritoapi_meritocracia;

create sequence useq_mae_opcion;

alter sequence useq_mae_opcion owner to postgres;

grant select, usage on sequence useq_mae_opcion to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_opcion to uc_meritoapi_meritocracia;

create sequence useq_mae_pais;

alter sequence useq_mae_pais owner to "usrMeritocracia";

grant select, usage on sequence useq_mae_pais to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_pais to uc_meritoapi_meritocracia;

create sequence useq_mae_perfil;

alter sequence useq_mae_perfil owner to postgres;

grant select, usage on sequence useq_mae_perfil to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_perfil to uc_meritoapi_meritocracia;

create sequence useq_mov_archivo;

alter sequence useq_mov_archivo owner to postgres;

grant select, usage on sequence useq_mov_archivo to uc_meritoapi_meritocracia;

create sequence useq_mov_opcion_perfil;

alter sequence useq_mov_opcion_perfil owner to postgres;

grant select, usage on sequence useq_mov_opcion_perfil to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_opcion_perfil to uc_meritoapi_meritocracia;

create sequence useq_mov_sesion;

alter sequence useq_mov_sesion owner to postgres;

grant select, usage on sequence useq_mov_sesion to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_sesion to uc_meritoapi_meritocracia;

create sequence useq_mov_usuario;

alter sequence useq_mov_usuario owner to postgres;

grant select, usage on sequence useq_mov_usuario to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_usuario to uc_meritoapi_meritocracia;

create sequence useq_mov_usuario_perfil;

alter sequence useq_mov_usuario_perfil owner to postgres;

grant select, usage on sequence useq_mov_usuario_perfil to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_usuario_perfil to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_distrito_judicial;

alter sequence useq_aud_mae_distrito_judicial owner to "usrMeritocracia";

grant select, usage on sequence useq_aud_mae_distrito_judicial to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_distrito_judicial to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_opcion;

alter sequence useq_aud_mae_opcion owner to postgres;

grant select, usage on sequence useq_aud_mae_opcion to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_opcion to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_pais;

alter sequence useq_aud_mae_pais owner to "usrMeritocracia";

grant select, usage on sequence useq_aud_mae_pais to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_pais to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_perfil;

alter sequence useq_aud_mae_perfil owner to postgres;

grant select, usage on sequence useq_aud_mae_perfil to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_perfil to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_archivo;

alter sequence useq_aud_mov_archivo owner to postgres;

grant select, usage on sequence useq_aud_mov_archivo to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_opcion_perfil;

alter sequence useq_aud_mov_opcion_perfil owner to postgres;

grant select, usage on sequence useq_aud_mov_opcion_perfil to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_opcion_perfil to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_sesion;

alter sequence useq_aud_mov_sesion owner to postgres;

grant select, usage on sequence useq_aud_mov_sesion to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_sesion to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_usuario;

alter sequence useq_aud_mov_usuario owner to postgres;

grant select, usage on sequence useq_aud_mov_usuario to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_usuario to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_usuario_perfil;

alter sequence useq_aud_mov_usuario_perfil owner to postgres;

grant select, usage on sequence useq_aud_mov_usuario_perfil to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_usuario_perfil to uc_meritoapi_meritocracia;

create table aud_mae_distrito_judicial
(
    n_trns_id         bigint not null
        constraint pk_aud_mae_distrito_judicial
            primary key,
    f_trns            timestamp(6),
    b_trns            varchar(1),
    c_trns_uid        varchar(30),
    c_trns_pc         varchar(30),
    n_trns_ip         varchar(40),
    c_trns_mcaddr     varchar(17),
    n_distrito_jud_id bigint,
    x_nombre          varchar(100),
    x_nom_corto       varchar(50),
    c_sigla           varchar(5),
    l_activo          varchar(1),
    f_registro        timestamp,
    f_aud             timestamp,
    b_aud             varchar(1),
    c_aud_uid         varchar(30),
    c_aud_uidred      varchar(30),
    c_aud_pc          varchar(30),
    c_aud_ip          varchar(40),
    c_aud_mcaddr      varchar(17)
);

alter table aud_mae_distrito_judicial
    owner to "usrMeritocracia";

grant insert, select, update on aud_mae_distrito_judicial to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_distrito_judicial to uc_meritoapi_meritocracia;

create table aud_mae_opcion
(
    n_trns_id            bigint not null
        constraint pk_aud_mae_opcion
            primary key,
    f_trns               timestamp(6),
    b_trns               varchar(1),
    c_trns_uid           varchar(30),
    c_trns_pc            varchar(30),
    n_trns_ip            varchar(40),
    c_trns_mcaddr        varchar(17),
    n_opcion_id          integer,
    c_opcion             char(5),
    x_nombre             varchar(50),
    x_url                varchar(45),
    x_icono              varchar(25),
    n_orden              integer,
    n_opcion_superior_id integer,
    l_activo             varchar(1),
    f_registro           timestamp,
    f_aud                timestamp,
    b_aud                varchar(1),
    c_aud_uid            varchar(30),
    c_aud_uidred         varchar(30),
    c_aud_pc             varchar(30),
    c_aud_ip             varchar(40),
    c_aud_mcaddr         varchar(17)
);

alter table aud_mae_opcion
    owner to postgres;

grant insert, select, update on aud_mae_opcion to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_opcion to uc_meritoapi_meritocracia;

create table aud_mae_pais
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_pais
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_pais_id     bigint,
    x_pais        varchar(150),
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_pais
    owner to "usrMeritocracia";

grant insert, select, update on aud_mae_pais to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_pais to uc_meritoapi_meritocracia;

create table aud_mae_perfil
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_perfil
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_perfil_id   integer,
    x_nombre      varchar(50),
    c_rol         varchar(20),
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_perfil
    owner to postgres;

grant insert, select, update on aud_mae_perfil to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_perfil to uc_meritoapi_meritocracia;

create table aud_mov_archivo
(
    n_trns_id       bigint                                               not null
        constraint pk_aud_mov_archivo
            primary key,
    f_trns          timestamp(6),
    b_trns          varchar(1),
    c_trns_uid      varchar(30),
    c_trns_pc       varchar(30),
    n_trns_ip       varchar(40),
    c_trns_mcaddr   varchar(17),
    n_archivo_id    bigint,
    x_nombre        varchar(200),
    x_extension     varchar(10),
    n_tamanio_bytes bigint,
    x_uuid          varchar(100),
    l_activo        varchar(1),
    f_registro      timestamp,
    f_aud           timestamp,
    b_aud           varchar(1),
    c_aud_uid       varchar(30),
    c_aud_uidred    varchar(30),
    c_aud_pc        varchar(30),
    c_aud_ip        varchar(40),
    c_aud_mcaddr    varchar(17),
    x_tipo          varchar(50) default 'POR_DEFINIR'::character varying not null
);

alter table aud_mov_archivo
    owner to postgres;

grant insert, select, update on aud_mov_archivo to uc_meritoapi_meritocracia;

create table aud_mov_opcion_perfil
(
    n_trns_id          bigint not null
        constraint pk_aud_mov_opcion_perfil
            primary key,
    f_trns             timestamp(6),
    b_trns             varchar(1),
    c_trns_uid         varchar(30),
    c_trns_pc          varchar(30),
    n_trns_ip          varchar(40),
    c_trns_mcaddr      varchar(17),
    n_opcion_perfil_id integer,
    n_opcion_id        integer,
    n_perfil_id        integer,
    l_activo           varchar(1),
    f_registro         timestamp,
    f_aud              timestamp,
    b_aud              varchar(1),
    c_aud_uid          varchar(30),
    c_aud_uidred       varchar(30),
    c_aud_pc           varchar(30),
    c_aud_ip           varchar(40),
    c_aud_mcaddr       varchar(17)
);

alter table aud_mov_opcion_perfil
    owner to postgres;

grant insert, select, update on aud_mov_opcion_perfil to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_opcion_perfil to uc_meritoapi_meritocracia;

create table aud_mov_sesion
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_sesion
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_sesion_id   bigint,
    n_usuario_id  bigint,
    f_ingreso     timestamp,
    f_salida      timestamp,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_sesion
    owner to postgres;

grant insert, select, update on aud_mov_sesion to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_sesion to uc_meritoapi_meritocracia;

create table aud_mov_usuario
(
    n_trns_id         bigint not null
        constraint pk_aud_mov_usuario
            primary key,
    f_trns            timestamp(6),
    b_trns            varchar(1),
    c_trns_uid        varchar(30),
    c_trns_pc         varchar(30),
    n_trns_ip         varchar(40),
    c_trns_mcaddr     varchar(17),
    n_usuario_id      bigint,
    x_usuario         varchar(25),
    x_clave           varchar(100),
    x_nombre_completo varchar(150),
    x_cargo           varchar(100),
    x_dependencia     varchar(100),
    x_email           varchar(50),
    l_activo          varchar(1),
    f_registro        timestamp,
    f_aud             timestamp,
    b_aud             varchar(1),
    c_aud_uid         varchar(30),
    c_aud_uidred      varchar(30),
    c_aud_pc          varchar(30),
    c_aud_ip          varchar(40),
    c_aud_mcaddr      varchar(17)
);

alter table aud_mov_usuario
    owner to postgres;

grant insert, select, update on aud_mov_usuario to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_usuario to uc_meritoapi_meritocracia;

create table aud_mov_usuario_perfil
(
    n_trns_id           bigint not null
        constraint pk_aud_mov_usuario_perfil
            primary key,
    f_trns              timestamp(6),
    b_trns              varchar(1),
    c_trns_uid          varchar(30),
    c_trns_pc           varchar(30),
    n_trns_ip           varchar(40),
    c_trns_mcaddr       varchar(17),
    n_usuario_perfil_id bigint,
    n_usuario_id        bigint,
    n_perfil_id         bigint,
    l_activo            varchar(1),
    f_registro          timestamp,
    f_aud               timestamp,
    b_aud               varchar(1),
    c_aud_uid           varchar(30),
    c_aud_uidred        varchar(30),
    c_aud_pc            varchar(30),
    c_aud_ip            varchar(40),
    c_aud_mcaddr        varchar(17)
);

alter table aud_mov_usuario_perfil
    owner to postgres;

grant insert, select, update on aud_mov_usuario_perfil to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_usuario_perfil to uc_meritoapi_meritocracia;

create table mae_distrito_judicial
(
    n_distrito_jud_id bigint      default nextval('meritocracia.useq_mae_distrito_judicial'::regclass) not null
        constraint pk_mae_distrito_judicial
            primary key,
    x_nombre          varchar(100)                                                                     not null,
    x_nom_corto       varchar(50)                                                                      not null,
    c_sigla           varchar(6)                                                                       not null,
    l_activo          varchar(1)  default '1'::character varying                                       not null,
    f_registro        timestamp   default LOCALTIMESTAMP                                               not null,
    f_aud             timestamp   default LOCALTIMESTAMP                                               not null,
    b_aud             varchar(1)  default 'I'::character varying                                       not null,
    c_aud_uid         varchar(30) default CURRENT_USER,
    c_aud_uidred      varchar(30),
    c_aud_pc          varchar(30),
    c_aud_ip          varchar(40),
    c_aud_mcaddr      varchar(17)
);

alter table mae_distrito_judicial
    owner to "usrMeritocracia";

grant insert, select, update on mae_distrito_judicial to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_distrito_judicial to uc_meritoapi_meritocracia;

create table mae_opcion
(
    n_opcion_id          integer     default nextval('meritocracia.useq_mae_opcion'::regclass) not null
        constraint pk_mae_opcion
            primary key,
    c_opcion             char(5)                                                               not null,
    x_nombre             varchar(50)                                                           not null,
    x_url                varchar(45)                                                           not null,
    x_icono              varchar(25)                                                           not null,
    n_orden              integer                                                               not null,
    n_opcion_superior_id integer
        constraint fk_mae_opcion_padre
            references mae_opcion,
    l_activo             varchar(1)  default '1'::character varying                            not null,
    f_registro           timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud                timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud                varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid            varchar(30) default CURRENT_USER,
    c_aud_uidred         varchar(30),
    c_aud_pc             varchar(30),
    c_aud_ip             varchar(40),
    c_aud_mcaddr         varchar(17)
);

alter table mae_opcion
    owner to postgres;

grant insert, select, update on mae_opcion to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_opcion to uc_meritoapi_meritocracia;

create table mae_pais
(
    n_pais_id    bigint      default nextval('meritocracia.useq_mae_pais'::regclass) not null
        constraint pk_mae_pais
            primary key,
    x_pais       varchar(150)                                                        not null,
    l_activo     varchar(1)  default '1'::character varying                          not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                  not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                  not null,
    b_aud        varchar(1)  default 'I'::character varying                          not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_pais
    owner to "usrMeritocracia";

grant insert, select, update on mae_pais to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_pais to uc_meritoapi_meritocracia;

create table mae_perfil
(
    n_perfil_id  integer     default nextval('meritocracia.useq_mae_perfil'::regclass) not null
        constraint pk_mae_perfil
            primary key,
    x_nombre     varchar(50)                                                           not null,
    c_rol        varchar(20)                                                           not null,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_perfil
    owner to postgres;

grant insert, select, update on mae_perfil to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_perfil to uc_meritoapi_meritocracia;

create table mov_archivo
(
    n_archivo_id    bigint      default nextval('meritocracia.useq_mov_archivo'::regclass) not null
        constraint pk_mov_archivo
            primary key,
    x_nombre        varchar(200)                                                           not null,
    x_extension     varchar(10)                                                            not null,
    n_tamanio_bytes bigint,
    x_uuid          varchar(100)                                                           not null,
    l_activo        varchar(1)  default '1'::character varying                             not null,
    f_registro      timestamp   default LOCALTIMESTAMP                                     not null,
    f_aud           timestamp   default LOCALTIMESTAMP                                     not null,
    b_aud           varchar(1)  default 'I'::character varying                             not null,
    c_aud_uid       varchar(30) default CURRENT_USER,
    c_aud_uidred    varchar(30),
    c_aud_pc        varchar(30),
    c_aud_ip        varchar(40),
    c_aud_mcaddr    varchar(17),
    x_tipo          varchar(50) default 'POR_DEFINIR'::character varying                   not null
)
    tablespace "TBS_ACCESO_JUSTICIA";

alter table mov_archivo
    owner to postgres;

grant insert, select, update on mov_archivo to uc_meritoapi_meritocracia;

create table mov_opcion_perfil
(
    n_opcion_perfil_id integer     default nextval('meritocracia.useq_mov_opcion_perfil'::regclass) not null
        constraint pk_mov_opcion_perfil
            primary key,
    n_opcion_id        integer                                                                      not null
        constraint fk_mop_opcion
            references mae_opcion,
    n_perfil_id        integer                                                                      not null
        constraint fk_mop_perfil
            references mae_perfil,
    l_activo           varchar(1)  default '1'::character varying                                   not null,
    f_registro         timestamp   default LOCALTIMESTAMP                                           not null,
    f_aud              timestamp   default LOCALTIMESTAMP                                           not null,
    b_aud              varchar(1)  default 'I'::character varying                                   not null,
    c_aud_uid          varchar(30) default CURRENT_USER,
    c_aud_uidred       varchar(30),
    c_aud_pc           varchar(30),
    c_aud_ip           varchar(40),
    c_aud_mcaddr       varchar(17)
);

alter table mov_opcion_perfil
    owner to postgres;

grant insert, select, update on mov_opcion_perfil to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_opcion_perfil to uc_meritoapi_meritocracia;

create table mov_usuario
(
    n_usuario_id      bigint      default nextval('meritocracia.useq_mov_usuario'::regclass) not null
        constraint pk_mov_usuario
            primary key,
    x_usuario         varchar(25)                                                            not null
        constraint uq_mov_usuario_login
            unique,
    x_clave           varchar(100)                                                           not null,
    x_nombre_completo varchar(150)                                                           not null,
    x_cargo           varchar(100)                                                           not null,
    x_dependencia     varchar(100)                                                           not null,
    x_email           varchar(50),
    l_activo          varchar(1)  default '1'::character varying                             not null,
    f_registro        timestamp   default LOCALTIMESTAMP                                     not null,
    f_aud             timestamp   default LOCALTIMESTAMP                                     not null,
    b_aud             varchar(1)  default 'I'::character varying                             not null,
    c_aud_uid         varchar(30) default CURRENT_USER,
    c_aud_uidred      varchar(30),
    c_aud_pc          varchar(30),
    c_aud_ip          varchar(40),
    c_aud_mcaddr      varchar(17)
);

alter table mov_usuario
    owner to postgres;

create table mov_sesion
(
    n_sesion_id  bigint      default nextval('meritocracia.useq_mov_sesion'::regclass) not null
        constraint pk_mov_sesion
            primary key,
    n_usuario_id bigint                                                                not null
        constraint fk_mov_sesion_usuario
            references mov_usuario,
    f_ingreso    timestamp   default LOCALTIMESTAMP                                    not null,
    f_salida     timestamp,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_sesion
    owner to postgres;

grant insert, select, update on mov_sesion to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_sesion to uc_meritoapi_meritocracia;

grant insert, select, update on mov_usuario to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_usuario to uc_meritoapi_meritocracia;

create table mov_usuario_perfil
(
    n_usuario_perfil_id bigint      default nextval('meritocracia.useq_mov_usuario_perfil'::regclass) not null
        constraint pk_mov_usuario_perfil
            primary key,
    n_usuario_id        bigint                                                                        not null
        constraint fk_mov_up_usuario
            references mov_usuario,
    n_perfil_id         bigint                                                                        not null
        constraint fk_mov_up_perfil
            references mae_perfil,
    l_activo            varchar(1)  default '1'::character varying                                    not null,
    f_registro          timestamp   default LOCALTIMESTAMP                                            not null,
    f_aud               timestamp   default LOCALTIMESTAMP                                            not null,
    b_aud               varchar(1)  default 'I'::character varying                                    not null,
    c_aud_uid           varchar(30) default CURRENT_USER,
    c_aud_uidred        varchar(30),
    c_aud_pc            varchar(30),
    c_aud_ip            varchar(40),
    c_aud_mcaddr        varchar(17)
);

alter table mov_usuario_perfil
    owner to postgres;

grant insert, select, update on mov_usuario_perfil to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_usuario_perfil to uc_meritoapi_meritocracia;

create function ufn_mae_distrito_judicial() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_distrito_judicial(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_distrito_jud_id, x_nombre, x_nom_corto, c_sigla, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_distrito_judicial'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_distrito_jud_id, OLD.x_nombre, OLD.x_nom_corto, OLD.c_sigla, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_distrito_judicial(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_distrito_jud_id, x_nombre, x_nom_corto, c_sigla, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_distrito_judicial'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_distrito_jud_id, OLD.x_nombre, OLD.x_nom_corto, OLD.c_sigla, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_distrito_judicial() owner to "usrMeritocracia";

grant execute on function ufn_mae_distrito_judicial() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_distrito_judicial() to uc_meritoapi_meritocracia;

create function ufn_mae_opcion() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_opcion(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_opcion_id, c_opcion, x_nombre, x_url, x_icono, n_orden, n_opcion_superior_id, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_opcion'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_opcion_id, OLD.c_opcion, OLD.x_nombre, OLD.x_url, OLD.x_icono, OLD.n_orden, OLD.n_opcion_superior_id, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_opcion(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_opcion_id, c_opcion, x_nombre, x_url, x_icono, n_orden, n_opcion_superior_id, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_opcion'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_opcion_id, OLD.c_opcion, OLD.x_nombre, OLD.x_url, OLD.x_icono, OLD.n_orden, OLD.n_opcion_superior_id, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_opcion() owner to postgres;

grant execute on function ufn_mae_opcion() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_opcion() to uc_meritoapi_meritocracia;

create function ufn_mae_pais() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_pais(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_pais_id, x_pais, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_pais'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_pais_id, OLD.x_pais, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_pais(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_pais_id, x_pais, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_pais'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_pais_id, OLD.x_pais, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_pais() owner to "usrMeritocracia";

grant execute on function ufn_mae_pais() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_pais() to uc_meritoapi_meritocracia;

create function ufn_mae_perfil() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_perfil(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_perfil_id, x_nombre, c_rol, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_perfil'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_perfil_id, OLD.x_nombre, OLD.c_rol, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_perfil(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_perfil_id, x_nombre, c_rol, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_perfil'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_perfil_id, OLD.x_nombre, OLD.c_rol, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_perfil() owner to postgres;

grant execute on function ufn_mae_perfil() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_perfil() to uc_meritoapi_meritocracia;

create function ufn_mov_archivo() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_archivo(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_archivo_id, x_nombre, x_tipo, x_extension, n_tamanio_bytes, x_uuid, 
            l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_archivo'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_archivo_id, OLD.x_nombre, OLD.x_tipo, OLD.x_extension, OLD.n_tamanio_bytes, OLD.x_uuid, 
            OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_archivo(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_archivo_id, x_nombre, x_tipo, x_extension, n_tamanio_bytes, x_uuid, 
            l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_archivo'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_archivo_id, OLD.x_nombre, OLD.x_tipo, OLD.x_extension, OLD.n_tamanio_bytes, OLD.x_uuid, 
            OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_archivo() owner to postgres;

grant execute on function ufn_mov_archivo() to uc_meritoapi_meritocracia;

create function ufn_mov_opcion_perfil() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_opcion_perfil(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_opcion_perfil_id, n_opcion_id, n_perfil_id, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_opcion_perfil'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_opcion_perfil_id, OLD.n_opcion_id, OLD.n_perfil_id, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_opcion_perfil(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_opcion_perfil_id, n_opcion_id, n_perfil_id, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_opcion_perfil'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_opcion_perfil_id, OLD.n_opcion_id, OLD.n_perfil_id, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_opcion_perfil() owner to postgres;

grant execute on function ufn_mov_opcion_perfil() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_opcion_perfil() to uc_meritoapi_meritocracia;

create function ufn_mov_sesion() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_sesion(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_sesion_id, n_usuario_id, f_ingreso, f_salida, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_sesion'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_sesion_id, OLD.n_usuario_id, OLD.f_ingreso, OLD.f_salida, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Cuando se actualice (ej: cuando se agregue la f_salida), se guarda el historial
        INSERT INTO meritocracia.aud_mov_sesion(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_sesion_id, n_usuario_id, f_ingreso, f_salida, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_sesion'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_sesion_id, OLD.n_usuario_id, OLD.f_ingreso, OLD.f_salida, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_sesion() owner to postgres;

grant execute on function ufn_mov_sesion() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_sesion() to uc_meritoapi_meritocracia;

create function ufn_mov_usuario() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_usuario(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_usuario_id, x_usuario, x_clave, x_nombre_completo, x_cargo, x_dependencia, x_email, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_usuario'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_usuario_id, OLD.x_usuario, OLD.x_clave, OLD.x_nombre_completo, OLD.x_cargo, OLD.x_dependencia, OLD.x_email, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_usuario(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_usuario_id, x_usuario, x_clave, x_nombre_completo, x_cargo, x_dependencia, x_email, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_usuario'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_usuario_id, OLD.x_usuario, OLD.x_clave, OLD.x_nombre_completo, OLD.x_cargo, OLD.x_dependencia, OLD.x_email, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_usuario() owner to postgres;

grant execute on function ufn_mov_usuario() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_usuario() to uc_meritoapi_meritocracia;

create function ufn_mov_usuario_perfil() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_usuario_perfil(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_usuario_perfil_id, n_usuario_id, n_perfil_id, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_usuario_perfil'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_usuario_perfil_id, OLD.n_usuario_id, OLD.n_perfil_id, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_usuario_perfil(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_usuario_perfil_id, n_usuario_id, n_perfil_id, l_activo, f_registro,
            f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_usuario_perfil'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_usuario_perfil_id, OLD.n_usuario_id, OLD.n_perfil_id, OLD.l_activo, OLD.f_registro,
            OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_usuario_perfil() owner to postgres;

grant execute on function ufn_mov_usuario_perfil() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_usuario_perfil() to uc_meritoapi_meritocracia;



-- =============================================================================
-- EXTENSION DOMINIO MERITOCRACIA (RF005 / RF006 / RF007)
-- Nomenclatura: mae_ (maestros), mov_ (movimientos), aud_ (auditoría)
-- Cada tabla incluye l_activo, f_registro y los 7 campos de auditoría:
--   f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
-- =============================================================================

-- ----- SECUENCIAS DE TABLAS DE NEGOCIO -----
create sequence useq_mae_nivel;

alter sequence useq_mae_nivel owner to postgres;

grant select, usage on sequence useq_mae_nivel to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_nivel to uc_meritoapi_meritocracia;

create sequence useq_mae_especialidad;

alter sequence useq_mae_especialidad owner to postgres;

grant select, usage on sequence useq_mae_especialidad to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_especialidad to uc_meritoapi_meritocracia;

create sequence useq_mae_universidad;

alter sequence useq_mae_universidad owner to postgres;

grant select, usage on sequence useq_mae_universidad to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_universidad to uc_meritoapi_meritocracia;

create sequence useq_mae_colegio_abogado;

alter sequence useq_mae_colegio_abogado owner to postgres;

grant select, usage on sequence useq_mae_colegio_abogado to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_colegio_abogado to uc_meritoapi_meritocracia;

create sequence useq_mae_rubro;

alter sequence useq_mae_rubro owner to postgres;

grant select, usage on sequence useq_mae_rubro to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_rubro to uc_meritoapi_meritocracia;

create sequence useq_mae_subrubro;

alter sequence useq_mae_subrubro owner to postgres;

grant select, usage on sequence useq_mae_subrubro to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_subrubro to uc_meritoapi_meritocracia;

create sequence useq_mae_regla_puntaje;

alter sequence useq_mae_regla_puntaje owner to postgres;

grant select, usage on sequence useq_mae_regla_puntaje to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_regla_puntaje to uc_meritoapi_meritocracia;

create sequence useq_mae_criterio_desempate;

alter sequence useq_mae_criterio_desempate owner to postgres;

grant select, usage on sequence useq_mae_criterio_desempate to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_criterio_desempate to uc_meritoapi_meritocracia;

create sequence useq_mae_lista;

alter sequence useq_mae_lista owner to postgres;

grant select, usage on sequence useq_mae_lista to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_lista to uc_meritoapi_meritocracia;

create sequence useq_mae_lista_valor;

alter sequence useq_mae_lista_valor owner to postgres;

grant select, usage on sequence useq_mae_lista_valor to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_lista_valor to uc_meritoapi_meritocracia;

create sequence useq_mae_idioma;

alter sequence useq_mae_idioma owner to postgres;

grant select, usage on sequence useq_mae_idioma to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mae_idioma to uc_meritoapi_meritocracia;

create sequence useq_mov_fecha_valoracion;

alter sequence useq_mov_fecha_valoracion owner to postgres;

grant select, usage on sequence useq_mov_fecha_valoracion to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_fecha_valoracion to uc_meritoapi_meritocracia;

create sequence useq_mov_magistrado;

alter sequence useq_mov_magistrado owner to postgres;

grant select, usage on sequence useq_mov_magistrado to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_magistrado to uc_meritoapi_meritocracia;

create sequence useq_mov_asignacion_registrador;

alter sequence useq_mov_asignacion_registrador owner to postgres;

grant select, usage on sequence useq_mov_asignacion_registrador to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_asignacion_registrador to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_valoracion;

alter sequence useq_mov_ficha_valoracion owner to postgres;

grant select, usage on sequence useq_mov_ficha_valoracion to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_valoracion to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_rubro_puntaje;

alter sequence useq_mov_ficha_rubro_puntaje owner to postgres;

grant select, usage on sequence useq_mov_ficha_rubro_puntaje to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_rubro_puntaje to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_cargo_anterior;

alter sequence useq_mov_ficha_cargo_anterior owner to postgres;

grant select, usage on sequence useq_mov_ficha_cargo_anterior to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_cargo_anterior to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_provisionalidad;

alter sequence useq_mov_ficha_provisionalidad owner to postgres;

grant select, usage on sequence useq_mov_ficha_provisionalidad to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_provisionalidad to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_colegiatura;

alter sequence useq_mov_ficha_colegiatura owner to postgres;

grant select, usage on sequence useq_mov_ficha_colegiatura to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_colegiatura to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_grado_titulo;

alter sequence useq_mov_ficha_grado_titulo owner to postgres;

grant select, usage on sequence useq_mov_ficha_grado_titulo to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_grado_titulo to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_amag;

alter sequence useq_mov_ficha_amag owner to postgres;

grant select, usage on sequence useq_mov_ficha_amag to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_amag to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_estudio_posgrado;

alter sequence useq_mov_ficha_estudio_posgrado owner to postgres;

grant select, usage on sequence useq_mov_ficha_estudio_posgrado to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_estudio_posgrado to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_pasantia;

alter sequence useq_mov_ficha_pasantia owner to postgres;

grant select, usage on sequence useq_mov_ficha_pasantia to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_pasantia to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_curso_espec;

alter sequence useq_mov_ficha_curso_espec owner to postgres;

grant select, usage on sequence useq_mov_ficha_curso_espec to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_curso_espec to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_certamen;

alter sequence useq_mov_ficha_certamen owner to postgres;

grant select, usage on sequence useq_mov_ficha_certamen to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_certamen to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_evento;

alter sequence useq_mov_ficha_evento owner to postgres;

grant select, usage on sequence useq_mov_ficha_evento to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_evento to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_ofimatica;

alter sequence useq_mov_ficha_ofimatica owner to postgres;

grant select, usage on sequence useq_mov_ficha_ofimatica to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_ofimatica to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_idioma;

alter sequence useq_mov_ficha_idioma owner to postgres;

grant select, usage on sequence useq_mov_ficha_idioma to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_idioma to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_publicacion;

alter sequence useq_mov_ficha_publicacion owner to postgres;

grant select, usage on sequence useq_mov_ficha_publicacion to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_publicacion to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_distincion;

alter sequence useq_mov_ficha_distincion owner to postgres;

grant select, usage on sequence useq_mov_ficha_distincion to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_distincion to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_docencia;

alter sequence useq_mov_ficha_docencia owner to postgres;

grant select, usage on sequence useq_mov_ficha_docencia to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_docencia to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_demerito;

alter sequence useq_mov_ficha_demerito owner to postgres;

grant select, usage on sequence useq_mov_ficha_demerito to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_demerito to uc_meritoapi_meritocracia;

create sequence useq_mov_ficha_evidencia;

alter sequence useq_mov_ficha_evidencia owner to postgres;

grant select, usage on sequence useq_mov_ficha_evidencia to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_mov_ficha_evidencia to uc_meritoapi_meritocracia;

-- ----- SECUENCIAS DE TABLAS DE AUDITORÍA -----
create sequence useq_aud_mae_nivel;

alter sequence useq_aud_mae_nivel owner to postgres;

grant select, usage on sequence useq_aud_mae_nivel to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_nivel to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_especialidad;

alter sequence useq_aud_mae_especialidad owner to postgres;

grant select, usage on sequence useq_aud_mae_especialidad to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_especialidad to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_universidad;

alter sequence useq_aud_mae_universidad owner to postgres;

grant select, usage on sequence useq_aud_mae_universidad to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_universidad to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_colegio_abogado;

alter sequence useq_aud_mae_colegio_abogado owner to postgres;

grant select, usage on sequence useq_aud_mae_colegio_abogado to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_colegio_abogado to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_rubro;

alter sequence useq_aud_mae_rubro owner to postgres;

grant select, usage on sequence useq_aud_mae_rubro to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_rubro to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_subrubro;

alter sequence useq_aud_mae_subrubro owner to postgres;

grant select, usage on sequence useq_aud_mae_subrubro to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_subrubro to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_regla_puntaje;

alter sequence useq_aud_mae_regla_puntaje owner to postgres;

grant select, usage on sequence useq_aud_mae_regla_puntaje to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_regla_puntaje to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_criterio_desempate;

alter sequence useq_aud_mae_criterio_desempate owner to postgres;

grant select, usage on sequence useq_aud_mae_criterio_desempate to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_criterio_desempate to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_lista;

alter sequence useq_aud_mae_lista owner to postgres;

grant select, usage on sequence useq_aud_mae_lista to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_lista to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_lista_valor;

alter sequence useq_aud_mae_lista_valor owner to postgres;

grant select, usage on sequence useq_aud_mae_lista_valor to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_lista_valor to uc_meritoapi_meritocracia;

create sequence useq_aud_mae_idioma;

alter sequence useq_aud_mae_idioma owner to postgres;

grant select, usage on sequence useq_aud_mae_idioma to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mae_idioma to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_fecha_valoracion;

alter sequence useq_aud_mov_fecha_valoracion owner to postgres;

grant select, usage on sequence useq_aud_mov_fecha_valoracion to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_fecha_valoracion to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_magistrado;

alter sequence useq_aud_mov_magistrado owner to postgres;

grant select, usage on sequence useq_aud_mov_magistrado to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_magistrado to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_asignacion_registrador;

alter sequence useq_aud_mov_asignacion_registrador owner to postgres;

grant select, usage on sequence useq_aud_mov_asignacion_registrador to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_asignacion_registrador to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_valoracion;

alter sequence useq_aud_mov_ficha_valoracion owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_valoracion to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_valoracion to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_rubro_puntaje;

alter sequence useq_aud_mov_ficha_rubro_puntaje owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_rubro_puntaje to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_rubro_puntaje to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_cargo_anterior;

alter sequence useq_aud_mov_ficha_cargo_anterior owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_cargo_anterior to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_cargo_anterior to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_provisionalidad;

alter sequence useq_aud_mov_ficha_provisionalidad owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_provisionalidad to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_provisionalidad to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_colegiatura;

alter sequence useq_aud_mov_ficha_colegiatura owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_colegiatura to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_colegiatura to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_grado_titulo;

alter sequence useq_aud_mov_ficha_grado_titulo owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_grado_titulo to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_grado_titulo to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_amag;

alter sequence useq_aud_mov_ficha_amag owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_amag to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_amag to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_estudio_posgrado;

alter sequence useq_aud_mov_ficha_estudio_posgrado owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_estudio_posgrado to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_estudio_posgrado to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_pasantia;

alter sequence useq_aud_mov_ficha_pasantia owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_pasantia to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_pasantia to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_curso_espec;

alter sequence useq_aud_mov_ficha_curso_espec owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_curso_espec to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_curso_espec to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_certamen;

alter sequence useq_aud_mov_ficha_certamen owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_certamen to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_certamen to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_evento;

alter sequence useq_aud_mov_ficha_evento owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_evento to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_evento to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_ofimatica;

alter sequence useq_aud_mov_ficha_ofimatica owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_ofimatica to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_ofimatica to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_idioma;

alter sequence useq_aud_mov_ficha_idioma owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_idioma to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_idioma to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_publicacion;

alter sequence useq_aud_mov_ficha_publicacion owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_publicacion to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_publicacion to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_distincion;

alter sequence useq_aud_mov_ficha_distincion owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_distincion to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_distincion to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_docencia;

alter sequence useq_aud_mov_ficha_docencia owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_docencia to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_docencia to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_demerito;

alter sequence useq_aud_mov_ficha_demerito owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_demerito to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_demerito to uc_meritoapi_meritocracia;

create sequence useq_aud_mov_ficha_evidencia;

alter sequence useq_aud_mov_ficha_evidencia owner to postgres;

grant select, usage on sequence useq_aud_mov_ficha_evidencia to uc_meritocraciaapi_meritocracia;

grant select, usage on sequence useq_aud_mov_ficha_evidencia to uc_meritoapi_meritocracia;

-- ----- TABLAS DE AUDITORÍA -----
create table aud_mae_nivel
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_nivel
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_nivel_id   bigint,
    c_nivel      varchar(20),
    x_nombre     varchar(100),
    n_orden      integer,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_nivel
    owner to postgres;

grant insert, select, update on aud_mae_nivel to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_nivel to uc_meritoapi_meritocracia;

create table aud_mae_especialidad
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_especialidad
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_especialidad_id bigint,
    c_especialidad    varchar(20),
    x_nombre          varchar(100),
    n_orden           integer,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_especialidad
    owner to postgres;

grant insert, select, update on aud_mae_especialidad to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_especialidad to uc_meritoapi_meritocracia;

create table aud_mae_universidad
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_universidad
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_universidad_id bigint,
    x_nombre         varchar(200),
    c_codigo         varchar(20),
    n_pais_id        bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_universidad
    owner to postgres;

grant insert, select, update on aud_mae_universidad to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_universidad to uc_meritoapi_meritocracia;

create table aud_mae_colegio_abogado
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_colegio_abogado
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_colegio_abog_id bigint,
    x_nombre          varchar(150),
    c_sigla           varchar(20),
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_colegio_abogado
    owner to postgres;

grant insert, select, update on aud_mae_colegio_abogado to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_colegio_abogado to uc_meritoapi_meritocracia;

create table aud_mae_rubro
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_rubro
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_rubro_id                bigint,
    c_rubro                   varchar(5),
    x_nombre                  varchar(200),
    n_orden                   integer,
    n_puntaje_max             numeric(10, 3),
    n_anios_vigencia          integer,
    l_suspendido              varchar(1),
    l_permite_negativo        varchar(1),
    l_excluye_desemp_meritos  varchar(1),
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_rubro
    owner to postgres;

grant insert, select, update on aud_mae_rubro to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_rubro to uc_meritoapi_meritocracia;

create table aud_mae_subrubro
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_subrubro
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_subrubro_id    bigint,
    n_rubro_id       bigint,
    c_subrubro       varchar(10),
    x_nombre         varchar(200),
    n_orden          integer,
    n_puntaje_max    numeric(10, 3),
    n_anios_vigencia integer,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_subrubro
    owner to postgres;

grant insert, select, update on aud_mae_subrubro to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_subrubro to uc_meritoapi_meritocracia;

create table aud_mae_regla_puntaje
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_regla_puntaje
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_regla_puntaje_id bigint,
    n_rubro_id         bigint,
    n_subrubro_id      bigint,
    c_clave            varchar(50),
    x_descripcion      varchar(300),
    x_condicion        varchar(200),
    n_puntaje          numeric(10, 3),
    n_puntaje_min      numeric(10, 3),
    n_puntaje_max      numeric(10, 3),
    n_anio_desde       integer,
    n_anio_hasta       integer,
    n_orden            integer,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_regla_puntaje
    owner to postgres;

grant insert, select, update on aud_mae_regla_puntaje to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_regla_puntaje to uc_meritoapi_meritocracia;

create table aud_mae_criterio_desempate
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_criterio_desempate
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_criterio_desemp_id bigint,
    c_cuadro             varchar(20),
    c_nivel              varchar(20),
    n_orden              integer,
    c_codigo             varchar(30),
    x_nombre             varchar(200),
    c_sentido            varchar(10),
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_criterio_desempate
    owner to postgres;

grant insert, select, update on aud_mae_criterio_desempate to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_criterio_desempate to uc_meritoapi_meritocracia;

create table aud_mae_lista
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_lista
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_lista_id   bigint,
    c_lista      varchar(40),
    x_nombre     varchar(150),
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_lista
    owner to postgres;

grant insert, select, update on aud_mae_lista to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_lista to uc_meritoapi_meritocracia;

create table aud_mae_lista_valor
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_lista_valor
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_lista_valor_id bigint,
    n_lista_id       bigint,
    c_valor          varchar(50),
    x_descripcion    varchar(200),
    n_orden          integer,
    n_valor_num      numeric(10, 3),
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_lista_valor
    owner to postgres;

grant insert, select, update on aud_mae_lista_valor to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_lista_valor to uc_meritoapi_meritocracia;

create table aud_mae_idioma
(
    n_trns_id     bigint not null
        constraint pk_aud_mae_idioma
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_idioma_id  bigint,
    x_nombre     varchar(80),
    c_tipo       varchar(15),
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mae_idioma
    owner to postgres;

grant insert, select, update on aud_mae_idioma to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mae_idioma to uc_meritoapi_meritocracia;

create table aud_mov_fecha_valoracion
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_fecha_valoracion
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_fecha_valoracion_id bigint,
    n_anio                integer,
    f_valoracion          date,
    x_resolucion          varchar(200),
    l_vigente             varchar(1),
    n_usuario_id          bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_fecha_valoracion
    owner to postgres;

grant insert, select, update on aud_mov_fecha_valoracion to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_fecha_valoracion to uc_meritoapi_meritocracia;

create table aud_mov_magistrado
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_magistrado
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_magistrado_id     bigint,
    c_dni               varchar(15),
    x_apellido_paterno  varchar(80),
    x_apellido_materno  varchar(80),
    x_nombres           varchar(100),
    x_nombre_completo   varchar(250),
    f_nacimiento        date,
    c_sexo              varchar(1),
    n_nivel_id          bigint,
    n_distrito_jud_id   bigint,
    l_cesante           varchar(1),
    f_cese              date,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_magistrado
    owner to postgres;

grant insert, select, update on aud_mov_magistrado to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_magistrado to uc_meritoapi_meritocracia;

create table aud_mov_asignacion_registrador
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_asignacion_registrador
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_asignacion_id         bigint,
    n_magistrado_id         bigint,
    n_usuario_titular_id    bigint,
    n_usuario_suplente_id   bigint,
    c_observacion           varchar(50),
    x_observacion           varchar(200),
    f_inicio                date,
    f_fin                   date,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_asignacion_registrador
    owner to postgres;

grant insert, select, update on aud_mov_asignacion_registrador to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_asignacion_registrador to uc_meritoapi_meritocracia;

create table aud_mov_ficha_valoracion
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_valoracion
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_id                bigint,
    n_magistrado_id           bigint,
    n_fecha_valoracion_id     bigint,
    n_nivel_id                bigint,
    n_distrito_jud_id         bigint,
    n_usuario_registrador_id  bigint,
    c_estado                  varchar(15),
    x_cargo_titular           varchar(150),
    f_juramentacion           date,
    h_juramento               time,
    f_cese                    date,
    f_reincorporacion         date,
    n_anios_titular           integer,
    n_meses_titular           integer,
    n_dias_titular            integer,
    n_puntaje_antiguedad      numeric(10, 3),
    n_especialidad1_id        bigint,
    n_especialidad2_id        bigint,
    n_puntaje_total           numeric(10, 3),
    n_puntaje_sin_antig       numeric(10, 3),
    n_puntaje_demeritos       numeric(10, 3),
    n_posicion_antiguedad     integer,
    n_orden_meritos           integer,
    n_orden_antiguedad        integer,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_valoracion
    owner to postgres;

grant insert, select, update on aud_mov_ficha_valoracion to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_valoracion to uc_meritoapi_meritocracia;

create table aud_mov_ficha_rubro_puntaje
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_rubro_puntaje
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_rubro_id   bigint,
    n_ficha_id         bigint,
    n_rubro_id         bigint,
    n_subrubro_id      bigint,
    n_puntaje_subtotal numeric(10, 3),
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_rubro_puntaje
    owner to postgres;

grant insert, select, update on aud_mov_ficha_rubro_puntaje to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_rubro_puntaje to uc_meritoapi_meritocracia;

create table aud_mov_ficha_cargo_anterior
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_cargo_anterior
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_cargo_ant_id bigint,
    n_ficha_id           bigint,
    n_nivel_id           bigint,
    f_inicio             date,
    f_fin                date,
    n_anios              integer,
    n_meses              integer,
    n_dias               integer,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_cargo_anterior
    owner to postgres;

grant insert, select, update on aud_mov_ficha_cargo_anterior to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_cargo_anterior to uc_meritoapi_meritocracia;

create table aud_mov_ficha_provisionalidad
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_provisionalidad
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_provis_id       bigint,
    n_ficha_id              bigint,
    f_inicio                date,
    f_fin                   date,
    n_anios                 integer,
    n_meses                 integer,
    n_dias                  integer,
    c_cargo                 varchar(50),
    x_organo_jurisdiccional varchar(200),
    x_documento             varchar(200),
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_provisionalidad
    owner to postgres;

grant insert, select, update on aud_mov_ficha_provisionalidad to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_provisionalidad to uc_meritoapi_meritocracia;

create table aud_mov_ficha_colegiatura
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_colegiatura
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_coleg_id    bigint,
    n_ficha_id          bigint,
    n_colegio_abog_id   bigint,
    f_colegiatura       date,
    n_anios_colegiatura integer,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_colegiatura
    owner to postgres;

grant insert, select, update on aud_mov_ficha_colegiatura to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_colegiatura to uc_meritoapi_meritocracia;

create table aud_mov_ficha_grado_titulo
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_grado_titulo
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_grado_id  bigint,
    n_ficha_id        bigint,
    c_nivel_grado     varchar(30),
    n_universidad_id  bigint,
    x_universidad     varchar(200),
    n_pais_id         bigint,
    f_obtencion       date,
    x_especialidad    varchar(150),
    x_mencion         varchar(150),
    x_observacion     varchar(300),
    n_puntaje         numeric(10, 3),
    n_archivo_id      bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_grado_titulo
    owner to postgres;

grant insert, select, update on aud_mov_ficha_grado_titulo to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_grado_titulo to uc_meritoapi_meritocracia;

create table aud_mov_ficha_amag
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_amag
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_amag_id bigint,
    n_ficha_id      bigint,
    c_tipo_curso    varchar(30),
    n_nota          numeric(5, 2),
    x_descripcion   varchar(300),
    n_anio_curso    integer,
    n_puntaje       numeric(10, 3),
    n_archivo_id    bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_amag
    owner to postgres;

grant insert, select, update on aud_mov_ficha_amag to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_amag to uc_meritoapi_meritocracia;

create table aud_mov_ficha_estudio_posgrado
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_estudio_posgrado
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_est_pos_id     bigint,
    n_ficha_id             bigint,
    c_tipo                 varchar(20),
    n_universidad_id       bigint,
    x_universidad          varchar(200),
    n_pais_id              bigint,
    c_orden_juridico       varchar(15),
    x_mencion              varchar(150),
    c_condicion_academica  varchar(20),
    n_num_semestre         integer,
    n_anio_ini_sem         integer,
    n_anio_fin_sem         integer,
    x_notas_semestre       varchar(200),
    n_promedio_semestre    numeric(5, 2),
    n_puntaje              numeric(10, 3),
    n_archivo_id           bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_estudio_posgrado
    owner to postgres;

grant insert, select, update on aud_mov_ficha_estudio_posgrado to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_estudio_posgrado to uc_meritoapi_meritocracia;

create table aud_mov_ficha_pasantia
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_pasantia
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_pasantia_id bigint,
    n_ficha_id          bigint,
    c_tipo              varchar(20),
    x_institucion       varchar(200),
    n_nota              numeric(5, 2),
    n_pais_id           bigint,
    f_inicio            date,
    f_fin               date,
    l_juridico          varchar(1),
    x_especialidad      varchar(150),
    x_mencion           varchar(150),
    n_horas             integer,
    x_realizado_en      varchar(150),
    n_puntaje           numeric(10, 3),
    n_archivo_id        bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_pasantia
    owner to postgres;

grant insert, select, update on aud_mov_ficha_pasantia to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_pasantia to uc_meritoapi_meritocracia;

create table aud_mov_ficha_curso_espec
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_curso_espec
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_curso_id  bigint,
    n_ficha_id        bigint,
    x_tipo_curso      varchar(100),
    c_orden_juridico  varchar(15),
    x_nombre_curso    varchar(200),
    x_institucion     varchar(200),
    n_pais_id         bigint,
    f_inicio          date,
    f_fin             date,
    x_especialidad    varchar(150),
    n_horas           integer,
    n_nota            numeric(5, 2),
    n_puntaje         numeric(10, 3),
    n_archivo_id      bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_curso_espec
    owner to postgres;

grant insert, select, update on aud_mov_ficha_curso_espec to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_curso_espec to uc_meritoapi_meritocracia;

create table aud_mov_ficha_certamen
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_certamen
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_certamen_id   bigint,
    n_ficha_id            bigint,
    c_tipo_certamen       varchar(30),
    c_tipo_participacion  varchar(20),
    c_orden_juridico      varchar(15),
    x_especialidad        varchar(150),
    x_tema                varchar(300),
    x_institucion         varchar(200),
    n_pais_id             bigint,
    f_inicio              date,
    f_fin                 date,
    c_modalidad           varchar(20),
    n_puntaje             numeric(10, 3),
    n_archivo_id          bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_certamen
    owner to postgres;

grant insert, select, update on aud_mov_ficha_certamen to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_certamen to uc_meritoapi_meritocracia;

create table aud_mov_ficha_evento
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_evento
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_evento_id  bigint,
    n_ficha_id         bigint,
    c_tipo_evento      varchar(30),
    c_orden_juridico   varchar(15),
    x_especialidad     varchar(150),
    x_tema             varchar(300),
    x_institucion      varchar(200),
    n_pais_id          bigint,
    f_inicio           date,
    f_fin              date,
    c_modalidad        varchar(20),
    c_tipo_documento   varchar(20),
    x_ambito           varchar(100),
    n_puntaje          numeric(10, 3),
    n_archivo_id       bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_evento
    owner to postgres;

grant insert, select, update on aud_mov_ficha_evento to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_evento to uc_meritoapi_meritocracia;

create table aud_mov_ficha_ofimatica
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_ofimatica
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_ofim_id   bigint,
    n_ficha_id        bigint,
    x_nombre_curso    varchar(200),
    x_institucion     varchar(200),
    n_horas           integer,
    c_nivel           varchar(20),
    c_tipo_documento  varchar(20),
    f_obtencion       date,
    n_puntaje         numeric(10, 3),
    n_archivo_id      bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_ofimatica
    owner to postgres;

grant insert, select, update on aud_mov_ficha_ofimatica to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_ofimatica to uc_meritoapi_meritocracia;

create table aud_mov_ficha_idioma
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_idioma
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_idioma_id bigint,
    n_ficha_id        bigint,
    c_tipo_idioma     varchar(15),
    n_idioma_id       bigint,
    x_idioma          varchar(80),
    x_institucion     varchar(200),
    n_duracion_meses  integer,
    c_nivel           varchar(20),
    c_tipo_documento  varchar(20),
    f_obtencion       date,
    n_puntaje         numeric(10, 3),
    n_archivo_id      bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_idioma
    owner to postgres;

grant insert, select, update on aud_mov_ficha_idioma to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_idioma to uc_meritoapi_meritocracia;

create table aud_mov_ficha_publicacion
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_publicacion
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_publ_id     bigint,
    n_ficha_id          bigint,
    c_tipo_publicacion  varchar(20),
    x_titulo            varchar(300),
    x_editorial         varchar(200),
    n_paginas           integer,
    x_num_edicion       varchar(50),
    x_auspicio          varchar(200),
    n_pais_id           bigint,
    n_anio              integer,
    c_orden_juridico    varchar(15),
    x_especialidad      varchar(150),
    x_institucion       varchar(200),
    f_publicacion       date,
    n_puntaje           numeric(10, 3),
    n_archivo_id        bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_publicacion
    owner to postgres;

grant insert, select, update on aud_mov_ficha_publicacion to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_publicacion to uc_meritoapi_meritocracia;

create table aud_mov_ficha_distincion
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_distincion
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_dist_id    bigint,
    n_ficha_id         bigint,
    c_tipo_distincion  varchar(100),
    x_descripcion      varchar(300),
    f_distincion       date,
    x_documento        varchar(200),
    x_institucion      varchar(200),
    n_pais_id          bigint,
    n_anio             integer,
    x_ambito           varchar(100),
    n_puntaje          numeric(10, 3),
    n_archivo_id       bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_distincion
    owner to postgres;

grant insert, select, update on aud_mov_ficha_distincion to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_distincion to uc_meritoapi_meritocracia;

create table aud_mov_ficha_docencia
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_docencia
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_docencia_id bigint,
    n_ficha_id          bigint,
    c_tipo_documento    varchar(30),
    n_universidad_id    bigint,
    x_universidad       varchar(200),
    n_horas_semanales   integer,
    f_inicio            date,
    f_fin               date,
    c_orden_juridico    varchar(15),
    x_especialidad      varchar(150),
    x_materia           varchar(150),
    x_categoria         varchar(50),
    x_condicion         varchar(50),
    n_puntaje           numeric(10, 3),
    n_archivo_id        bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_docencia
    owner to postgres;

grant insert, select, update on aud_mov_ficha_docencia to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_docencia to uc_meritoapi_meritocracia;

create table aud_mov_ficha_demerito
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_demerito
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_demerito_id bigint,
    n_ficha_id          bigint,
    c_tipo_medida       varchar(30),
    n_cantidad          integer,
    c_tipo_documento    varchar(30),
    n_anio_valoracion   integer,
    x_observacion       varchar(300),
    n_puntaje           numeric(10, 3),
    n_archivo_id        bigint,
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_demerito
    owner to postgres;

grant insert, select, update on aud_mov_ficha_demerito to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_demerito to uc_meritoapi_meritocracia;

create table aud_mov_ficha_evidencia
(
    n_trns_id     bigint not null
        constraint pk_aud_mov_ficha_evidencia
            primary key,
    f_trns        timestamp(6),
    b_trns        varchar(1),
    c_trns_uid    varchar(30),
    c_trns_pc     varchar(30),
    n_trns_ip     varchar(40),
    c_trns_mcaddr varchar(17),
    n_ficha_evidencia_id bigint,
    n_ficha_id           bigint,
    n_archivo_id         bigint,
    c_origen_tabla       varchar(40),
    n_origen_id          bigint,
    n_rubro_id           bigint,
    f_inicio_vigencia    date,
    f_fin_vigencia       date,
    c_estado_vigencia    varchar(20),
    l_activo      varchar(1),
    f_registro    timestamp,
    f_aud         timestamp,
    b_aud         varchar(1),
    c_aud_uid     varchar(30),
    c_aud_uidred  varchar(30),
    c_aud_pc      varchar(30),
    c_aud_ip      varchar(40),
    c_aud_mcaddr  varchar(17)
);

alter table aud_mov_ficha_evidencia
    owner to postgres;

grant insert, select, update on aud_mov_ficha_evidencia to uc_meritocraciaapi_meritocracia;

grant insert, select, update on aud_mov_ficha_evidencia to uc_meritoapi_meritocracia;

-- ----- TABLAS DE NEGOCIO -----
create table mae_nivel
(
    n_nivel_id bigint     default nextval('meritocracia.useq_mae_nivel'::regclass) not null
        constraint pk_mae_nivel
            primary key,
    c_nivel      varchar(20)                                                           not null
        constraint uq_mae_nivel_codigo
            unique,
    x_nombre     varchar(100)                                                          not null,
    n_orden      integer                                                               not null,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_nivel
    owner to postgres;

grant insert, select, update on mae_nivel to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_nivel to uc_meritoapi_meritocracia;

create table mae_especialidad
(
    n_especialidad_id bigint     default nextval('meritocracia.useq_mae_especialidad'::regclass) not null
        constraint pk_mae_especialidad
            primary key,
    c_especialidad varchar(20)                                                         not null
        constraint uq_mae_especialidad_codigo
            unique,
    x_nombre       varchar(100)                                                        not null,
    n_orden        integer                                                             not null,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_especialidad
    owner to postgres;

grant insert, select, update on mae_especialidad to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_especialidad to uc_meritoapi_meritocracia;

create table mae_universidad
(
    n_universidad_id bigint     default nextval('meritocracia.useq_mae_universidad'::regclass) not null
        constraint pk_mae_universidad
            primary key,
    x_nombre     varchar(200)                                                          not null,
    c_codigo     varchar(20),
    n_pais_id    bigint
        constraint fk_mae_universidad_pais
            references mae_pais,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_universidad
    owner to postgres;

grant insert, select, update on mae_universidad to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_universidad to uc_meritoapi_meritocracia;

create table mae_colegio_abogado
(
    n_colegio_abog_id bigint     default nextval('meritocracia.useq_mae_colegio_abogado'::regclass) not null
        constraint pk_mae_colegio_abogado
            primary key,
    x_nombre     varchar(150)                                                          not null,
    c_sigla      varchar(20),
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_colegio_abogado
    owner to postgres;

grant insert, select, update on mae_colegio_abogado to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_colegio_abogado to uc_meritoapi_meritocracia;

create table mae_rubro
(
    n_rubro_id bigint     default nextval('meritocracia.useq_mae_rubro'::regclass) not null
        constraint pk_mae_rubro
            primary key,
    c_rubro                   varchar(5)                                               not null
        constraint uq_mae_rubro_codigo
            unique,
    x_nombre                  varchar(200)                                             not null,
    n_orden                   integer                                                  not null,
    n_puntaje_max             numeric(10, 3),
    n_anios_vigencia          integer,
    l_suspendido              varchar(1)  default '0'::character varying               not null,
    l_permite_negativo        varchar(1)  default '0'::character varying               not null,
    l_excluye_desemp_meritos  varchar(1)  default '0'::character varying               not null,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_rubro
    owner to postgres;

grant insert, select, update on mae_rubro to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_rubro to uc_meritoapi_meritocracia;

create table mae_subrubro
(
    n_subrubro_id bigint     default nextval('meritocracia.useq_mae_subrubro'::regclass) not null
        constraint pk_mae_subrubro
            primary key,
    n_rubro_id       bigint                                                             not null
        constraint fk_mae_subrubro_rubro
            references mae_rubro,
    c_subrubro       varchar(10)                                                        not null,
    x_nombre         varchar(200)                                                       not null,
    n_orden          integer                                                            not null,
    n_puntaje_max    numeric(10, 3),
    n_anios_vigencia integer,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_subrubro
    owner to postgres;

grant insert, select, update on mae_subrubro to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_subrubro to uc_meritoapi_meritocracia;

create table mae_regla_puntaje
(
    n_regla_puntaje_id bigint     default nextval('meritocracia.useq_mae_regla_puntaje'::regclass) not null
        constraint pk_mae_regla_puntaje
            primary key,
    n_rubro_id      bigint                                                              not null
        constraint fk_mae_regla_rubro
            references mae_rubro,
    n_subrubro_id   bigint
        constraint fk_mae_regla_subrubro
            references mae_subrubro,
    c_clave         varchar(50)                                                         not null,
    x_descripcion   varchar(300)                                                        not null,
    x_condicion     varchar(200),
    n_puntaje       numeric(10, 3)                                                      not null,
    n_puntaje_min   numeric(10, 3),
    n_puntaje_max   numeric(10, 3),
    n_anio_desde    integer,
    n_anio_hasta    integer,
    n_orden         integer                                                             not null,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_regla_puntaje
    owner to postgres;

grant insert, select, update on mae_regla_puntaje to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_regla_puntaje to uc_meritoapi_meritocracia;

create table mae_criterio_desempate
(
    n_criterio_desemp_id bigint     default nextval('meritocracia.useq_mae_criterio_desempate'::regclass) not null
        constraint pk_mae_criterio_desempate
            primary key,
    c_cuadro     varchar(20)                                                           not null,
    c_nivel      varchar(20),
    n_orden      integer                                                               not null,
    c_codigo     varchar(30)                                                           not null,
    x_nombre     varchar(200)                                                          not null,
    c_sentido    varchar(10)                                                           not null,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_criterio_desempate
    owner to postgres;

grant insert, select, update on mae_criterio_desempate to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_criterio_desempate to uc_meritoapi_meritocracia;

create table mae_lista
(
    n_lista_id bigint     default nextval('meritocracia.useq_mae_lista'::regclass) not null
        constraint pk_mae_lista
            primary key,
    c_lista      varchar(40)                                                           not null
        constraint uq_mae_lista_codigo
            unique,
    x_nombre     varchar(150)                                                          not null,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_lista
    owner to postgres;

grant insert, select, update on mae_lista to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_lista to uc_meritoapi_meritocracia;

create table mae_lista_valor
(
    n_lista_valor_id bigint     default nextval('meritocracia.useq_mae_lista_valor'::regclass) not null
        constraint pk_mae_lista_valor
            primary key,
    n_lista_id   bigint                                                                not null
        constraint fk_mae_lista_valor_lista
            references mae_lista,
    c_valor      varchar(50)                                                           not null,
    x_descripcion varchar(200)                                                         not null,
    n_orden      integer                                                               not null,
    n_valor_num  numeric(10, 3),
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_lista_valor
    owner to postgres;

grant insert, select, update on mae_lista_valor to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_lista_valor to uc_meritoapi_meritocracia;

create table mae_idioma
(
    n_idioma_id bigint     default nextval('meritocracia.useq_mae_idioma'::regclass) not null
        constraint pk_mae_idioma
            primary key,
    x_nombre     varchar(80)                                                           not null,
    c_tipo       varchar(15)                                                           not null,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mae_idioma
    owner to postgres;

grant insert, select, update on mae_idioma to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mae_idioma to uc_meritoapi_meritocracia;

create table mov_fecha_valoracion
(
    n_fecha_valoracion_id bigint     default nextval('meritocracia.useq_mov_fecha_valoracion'::regclass) not null
        constraint pk_mov_fecha_valoracion
            primary key,
    n_anio       integer                                                               not null,
    f_valoracion date                                                                  not null,
    x_resolucion varchar(200),
    l_vigente    varchar(1)  default '0'::character varying                            not null,
    n_usuario_id bigint                                                                not null
        constraint fk_mov_fecha_val_usuario
            references mov_usuario,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_fecha_valoracion
    owner to postgres;

grant insert, select, update on mov_fecha_valoracion to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_fecha_valoracion to uc_meritoapi_meritocracia;

create table mov_magistrado
(
    n_magistrado_id bigint     default nextval('meritocracia.useq_mov_magistrado'::regclass) not null
        constraint pk_mov_magistrado
            primary key,
    c_dni               varchar(15)                                                    not null
        constraint uq_mov_magistrado_dni
            unique,
    x_apellido_paterno  varchar(80)                                                    not null,
    x_apellido_materno  varchar(80)                                                    not null,
    x_nombres           varchar(100)                                                   not null,
    x_nombre_completo   varchar(250)                                                   not null,
    f_nacimiento        date,
    c_sexo              varchar(1),
    n_nivel_id          bigint                                                         not null
        constraint fk_mov_magistrado_nivel
            references mae_nivel,
    n_distrito_jud_id   bigint
        constraint fk_mov_magistrado_distrito
            references mae_distrito_judicial,
    l_cesante           varchar(1)  default '0'::character varying                     not null,
    f_cese              date,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_magistrado
    owner to postgres;

grant insert, select, update on mov_magistrado to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_magistrado to uc_meritoapi_meritocracia;

create table mov_asignacion_registrador
(
    n_asignacion_id bigint     default nextval('meritocracia.useq_mov_asignacion_registrador'::regclass) not null
        constraint pk_mov_asignacion_registrador
            primary key,
    n_magistrado_id         bigint                                                     not null
        constraint fk_mov_asig_magistrado
            references mov_magistrado,
    n_usuario_titular_id    bigint                                                     not null
        constraint fk_mov_asig_usuario_tit
            references mov_usuario,
    n_usuario_suplente_id   bigint
        constraint fk_mov_asig_usuario_sup
            references mov_usuario,
    c_observacion           varchar(50),
    x_observacion           varchar(200),
    f_inicio                date,
    f_fin                   date,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_asignacion_registrador
    owner to postgres;

grant insert, select, update on mov_asignacion_registrador to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_asignacion_registrador to uc_meritoapi_meritocracia;

create table mov_ficha_valoracion
(
    n_ficha_id bigint     default nextval('meritocracia.useq_mov_ficha_valoracion'::regclass) not null
        constraint pk_mov_ficha_valoracion
            primary key,
    n_magistrado_id           bigint                                                   not null
        constraint fk_mov_ficha_magistrado
            references mov_magistrado,
    n_fecha_valoracion_id     bigint                                                   not null
        constraint fk_mov_ficha_fecha_val
            references mov_fecha_valoracion,
    n_nivel_id                bigint                                                   not null
        constraint fk_mov_ficha_nivel
            references mae_nivel,
    n_distrito_jud_id         bigint
        constraint fk_mov_ficha_distrito
            references mae_distrito_judicial,
    n_usuario_registrador_id  bigint
        constraint fk_mov_ficha_registrador
            references mov_usuario,
    c_estado                  varchar(15)  default 'ACTIVO'::character varying         not null,
    x_cargo_titular           varchar(150),
    f_juramentacion           date,
    h_juramento               time,
    f_cese                    date,
    f_reincorporacion         date,
    n_anios_titular           integer,
    n_meses_titular           integer,
    n_dias_titular            integer,
    n_puntaje_antiguedad      numeric(10, 3),
    n_especialidad1_id        bigint
        constraint fk_mov_ficha_esp1
            references mae_especialidad,
    n_especialidad2_id        bigint
        constraint fk_mov_ficha_esp2
            references mae_especialidad,
    n_puntaje_total           numeric(10, 3),
    n_puntaje_sin_antig       numeric(10, 3),
    n_puntaje_demeritos       numeric(10, 3),
    n_posicion_antiguedad     integer,
    n_orden_meritos           integer,
    n_orden_antiguedad        integer,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_valoracion
    owner to postgres;

grant insert, select, update on mov_ficha_valoracion to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_valoracion to uc_meritoapi_meritocracia;

create table mov_ficha_rubro_puntaje
(
    n_ficha_rubro_id bigint     default nextval('meritocracia.useq_mov_ficha_rubro_puntaje'::regclass) not null
        constraint pk_mov_ficha_rubro_puntaje
            primary key,
    n_ficha_id         bigint                                                          not null
        constraint fk_mov_ficha_rubro_ficha
            references mov_ficha_valoracion,
    n_rubro_id         bigint                                                          not null
        constraint fk_mov_ficha_rubro_rubro
            references mae_rubro,
    n_subrubro_id      bigint
        constraint fk_mov_ficha_rubro_sub
            references mae_subrubro,
    n_puntaje_subtotal numeric(10, 3)                                                  not null,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_rubro_puntaje
    owner to postgres;

grant insert, select, update on mov_ficha_rubro_puntaje to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_rubro_puntaje to uc_meritoapi_meritocracia;

create table mov_ficha_cargo_anterior
(
    n_ficha_cargo_ant_id bigint     default nextval('meritocracia.useq_mov_ficha_cargo_anterior'::regclass) not null
        constraint pk_mov_ficha_cargo_anterior
            primary key,
    n_ficha_id   bigint                                                                not null
        constraint fk_mov_ficha_cargo_ant_ficha
            references mov_ficha_valoracion,
    n_nivel_id   bigint                                                                not null
        constraint fk_mov_ficha_cargo_ant_nivel
            references mae_nivel,
    f_inicio     date,
    f_fin        date,
    n_anios      integer,
    n_meses      integer,
    n_dias       integer,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_cargo_anterior
    owner to postgres;

grant insert, select, update on mov_ficha_cargo_anterior to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_cargo_anterior to uc_meritoapi_meritocracia;

create table mov_ficha_provisionalidad
(
    n_ficha_provis_id bigint     default nextval('meritocracia.useq_mov_ficha_provisionalidad'::regclass) not null
        constraint pk_mov_ficha_provisionalidad
            primary key,
    n_ficha_id              bigint                                                     not null
        constraint fk_mov_ficha_provis_ficha
            references mov_ficha_valoracion,
    f_inicio                date,
    f_fin                   date,
    n_anios                 integer,
    n_meses                 integer,
    n_dias                  integer,
    c_cargo                 varchar(50),
    x_organo_jurisdiccional varchar(200),
    x_documento             varchar(200),
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_provisionalidad
    owner to postgres;

grant insert, select, update on mov_ficha_provisionalidad to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_provisionalidad to uc_meritoapi_meritocracia;

create table mov_ficha_colegiatura
(
    n_ficha_coleg_id bigint     default nextval('meritocracia.useq_mov_ficha_colegiatura'::regclass) not null
        constraint pk_mov_ficha_colegiatura
            primary key,
    n_ficha_id          bigint                                                         not null
        constraint fk_mov_ficha_coleg_ficha
            references mov_ficha_valoracion,
    n_colegio_abog_id   bigint                                                         not null
        constraint fk_mov_ficha_coleg_colegio
            references mae_colegio_abogado,
    f_colegiatura       date                                                           not null,
    n_anios_colegiatura integer,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_colegiatura
    owner to postgres;

grant insert, select, update on mov_ficha_colegiatura to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_colegiatura to uc_meritoapi_meritocracia;

create table mov_ficha_grado_titulo
(
    n_ficha_grado_id bigint     default nextval('meritocracia.useq_mov_ficha_grado_titulo'::regclass) not null
        constraint pk_mov_ficha_grado_titulo
            primary key,
    n_ficha_id        bigint                                                           not null
        constraint fk_mov_ficha_grado_ficha
            references mov_ficha_valoracion,
    c_nivel_grado     varchar(30)                                                      not null,
    n_universidad_id  bigint
        constraint fk_mov_ficha_grado_univ
            references mae_universidad,
    x_universidad     varchar(200),
    n_pais_id         bigint
        constraint fk_mov_ficha_grado_pais
            references mae_pais,
    f_obtencion       date,
    x_especialidad    varchar(150),
    x_mencion         varchar(150),
    x_observacion     varchar(300),
    n_puntaje         numeric(10, 3),
    n_archivo_id      bigint
        constraint fk_mov_ficha_grado_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_grado_titulo
    owner to postgres;

grant insert, select, update on mov_ficha_grado_titulo to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_grado_titulo to uc_meritoapi_meritocracia;

create table mov_ficha_amag
(
    n_ficha_amag_id bigint     default nextval('meritocracia.useq_mov_ficha_amag'::regclass) not null
        constraint pk_mov_ficha_amag
            primary key,
    n_ficha_id     bigint                                                              not null
        constraint fk_mov_ficha_amag_ficha
            references mov_ficha_valoracion,
    c_tipo_curso   varchar(30)                                                         not null,
    n_nota         numeric(5, 2),
    x_descripcion  varchar(300),
    n_anio_curso   integer,
    n_puntaje      numeric(10, 3),
    n_archivo_id   bigint
        constraint fk_mov_ficha_amag_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_amag
    owner to postgres;

grant insert, select, update on mov_ficha_amag to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_amag to uc_meritoapi_meritocracia;

create table mov_ficha_estudio_posgrado
(
    n_ficha_est_pos_id bigint     default nextval('meritocracia.useq_mov_ficha_estudio_posgrado'::regclass) not null
        constraint pk_mov_ficha_estudio_posgrado
            primary key,
    n_ficha_id             bigint                                                      not null
        constraint fk_mov_ficha_estpos_ficha
            references mov_ficha_valoracion,
    c_tipo                 varchar(20)                                                 not null,
    n_universidad_id       bigint
        constraint fk_mov_ficha_estpos_univ
            references mae_universidad,
    x_universidad          varchar(200),
    n_pais_id              bigint
        constraint fk_mov_ficha_estpos_pais
            references mae_pais,
    c_orden_juridico       varchar(15),
    x_mencion              varchar(150),
    c_condicion_academica  varchar(20),
    n_num_semestre         integer,
    n_anio_ini_sem         integer,
    n_anio_fin_sem         integer,
    x_notas_semestre       varchar(200),
    n_promedio_semestre    numeric(5, 2),
    n_puntaje              numeric(10, 3),
    n_archivo_id           bigint
        constraint fk_mov_ficha_estpos_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_estudio_posgrado
    owner to postgres;

grant insert, select, update on mov_ficha_estudio_posgrado to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_estudio_posgrado to uc_meritoapi_meritocracia;

create table mov_ficha_pasantia
(
    n_ficha_pasantia_id bigint     default nextval('meritocracia.useq_mov_ficha_pasantia'::regclass) not null
        constraint pk_mov_ficha_pasantia
            primary key,
    n_ficha_id      bigint                                                             not null
        constraint fk_mov_ficha_pasantia_ficha
            references mov_ficha_valoracion,
    c_tipo          varchar(20)                                                        not null,
    x_institucion   varchar(200),
    n_nota          numeric(5, 2),
    n_pais_id       bigint
        constraint fk_mov_ficha_pasantia_pais
            references mae_pais,
    f_inicio        date,
    f_fin           date,
    l_juridico      varchar(1),
    x_especialidad  varchar(150),
    x_mencion       varchar(150),
    n_horas         integer,
    x_realizado_en  varchar(150),
    n_puntaje       numeric(10, 3),
    n_archivo_id    bigint
        constraint fk_mov_ficha_pasantia_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_pasantia
    owner to postgres;

grant insert, select, update on mov_ficha_pasantia to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_pasantia to uc_meritoapi_meritocracia;

create table mov_ficha_curso_espec
(
    n_ficha_curso_id bigint     default nextval('meritocracia.useq_mov_ficha_curso_espec'::regclass) not null
        constraint pk_mov_ficha_curso_espec
            primary key,
    n_ficha_id        bigint                                                           not null
        constraint fk_mov_ficha_curso_ficha
            references mov_ficha_valoracion,
    x_tipo_curso      varchar(100),
    c_orden_juridico  varchar(15),
    x_nombre_curso    varchar(200)                                                     not null,
    x_institucion     varchar(200),
    n_pais_id         bigint
        constraint fk_mov_ficha_curso_pais
            references mae_pais,
    f_inicio          date,
    f_fin             date,
    x_especialidad    varchar(150),
    n_horas           integer,
    n_nota            numeric(5, 2),
    n_puntaje         numeric(10, 3),
    n_archivo_id      bigint
        constraint fk_mov_ficha_curso_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_curso_espec
    owner to postgres;

grant insert, select, update on mov_ficha_curso_espec to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_curso_espec to uc_meritoapi_meritocracia;

create table mov_ficha_certamen
(
    n_ficha_certamen_id bigint     default nextval('meritocracia.useq_mov_ficha_certamen'::regclass) not null
        constraint pk_mov_ficha_certamen
            primary key,
    n_ficha_id            bigint                                                       not null
        constraint fk_mov_ficha_certamen_ficha
            references mov_ficha_valoracion,
    c_tipo_certamen       varchar(30),
    c_tipo_participacion  varchar(20),
    c_orden_juridico      varchar(15),
    x_especialidad        varchar(150),
    x_tema                varchar(300),
    x_institucion         varchar(200),
    n_pais_id             bigint
        constraint fk_mov_ficha_certamen_pais
            references mae_pais,
    f_inicio              date,
    f_fin                 date,
    c_modalidad           varchar(20),
    n_puntaje             numeric(10, 3),
    n_archivo_id          bigint
        constraint fk_mov_ficha_certamen_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_certamen
    owner to postgres;

grant insert, select, update on mov_ficha_certamen to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_certamen to uc_meritoapi_meritocracia;

create table mov_ficha_evento
(
    n_ficha_evento_id bigint     default nextval('meritocracia.useq_mov_ficha_evento'::regclass) not null
        constraint pk_mov_ficha_evento
            primary key,
    n_ficha_id         bigint                                                          not null
        constraint fk_mov_ficha_evento_ficha
            references mov_ficha_valoracion,
    c_tipo_evento      varchar(30),
    c_orden_juridico   varchar(15),
    x_especialidad     varchar(150),
    x_tema             varchar(300),
    x_institucion      varchar(200),
    n_pais_id          bigint
        constraint fk_mov_ficha_evento_pais
            references mae_pais,
    f_inicio           date,
    f_fin              date,
    c_modalidad        varchar(20),
    c_tipo_documento   varchar(20),
    x_ambito           varchar(100),
    n_puntaje          numeric(10, 3),
    n_archivo_id       bigint
        constraint fk_mov_ficha_evento_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_evento
    owner to postgres;

grant insert, select, update on mov_ficha_evento to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_evento to uc_meritoapi_meritocracia;

create table mov_ficha_ofimatica
(
    n_ficha_ofim_id bigint     default nextval('meritocracia.useq_mov_ficha_ofimatica'::regclass) not null
        constraint pk_mov_ficha_ofimatica
            primary key,
    n_ficha_id        bigint                                                           not null
        constraint fk_mov_ficha_ofim_ficha
            references mov_ficha_valoracion,
    x_nombre_curso    varchar(200)                                                     not null,
    x_institucion     varchar(200),
    n_horas           integer,
    c_nivel           varchar(20),
    c_tipo_documento  varchar(20),
    f_obtencion       date,
    n_puntaje         numeric(10, 3),
    n_archivo_id      bigint
        constraint fk_mov_ficha_ofim_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_ofimatica
    owner to postgres;

grant insert, select, update on mov_ficha_ofimatica to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_ofimatica to uc_meritoapi_meritocracia;

create table mov_ficha_idioma
(
    n_ficha_idioma_id bigint     default nextval('meritocracia.useq_mov_ficha_idioma'::regclass) not null
        constraint pk_mov_ficha_idioma
            primary key,
    n_ficha_id        bigint                                                           not null
        constraint fk_mov_ficha_idioma_ficha
            references mov_ficha_valoracion,
    c_tipo_idioma     varchar(15)                                                      not null,
    n_idioma_id       bigint
        constraint fk_mov_ficha_idioma_idioma
            references mae_idioma,
    x_idioma          varchar(80),
    x_institucion     varchar(200),
    n_duracion_meses  integer,
    c_nivel           varchar(20),
    c_tipo_documento  varchar(20),
    f_obtencion       date,
    n_puntaje         numeric(10, 3),
    n_archivo_id      bigint
        constraint fk_mov_ficha_idioma_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_idioma
    owner to postgres;

grant insert, select, update on mov_ficha_idioma to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_idioma to uc_meritoapi_meritocracia;

create table mov_ficha_publicacion
(
    n_ficha_publ_id bigint     default nextval('meritocracia.useq_mov_ficha_publicacion'::regclass) not null
        constraint pk_mov_ficha_publicacion
            primary key,
    n_ficha_id          bigint                                                         not null
        constraint fk_mov_ficha_publ_ficha
            references mov_ficha_valoracion,
    c_tipo_publicacion  varchar(20)                                                    not null,
    x_titulo            varchar(300)                                                   not null,
    x_editorial         varchar(200),
    n_paginas           integer,
    x_num_edicion       varchar(50),
    x_auspicio          varchar(200),
    n_pais_id           bigint
        constraint fk_mov_ficha_publ_pais
            references mae_pais,
    n_anio              integer,
    c_orden_juridico    varchar(15),
    x_especialidad      varchar(150),
    x_institucion       varchar(200),
    f_publicacion       date,
    n_puntaje           numeric(10, 3),
    n_archivo_id        bigint
        constraint fk_mov_ficha_publ_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_publicacion
    owner to postgres;

grant insert, select, update on mov_ficha_publicacion to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_publicacion to uc_meritoapi_meritocracia;

create table mov_ficha_distincion
(
    n_ficha_dist_id bigint     default nextval('meritocracia.useq_mov_ficha_distincion'::regclass) not null
        constraint pk_mov_ficha_distincion
            primary key,
    n_ficha_id         bigint                                                          not null
        constraint fk_mov_ficha_dist_ficha
            references mov_ficha_valoracion,
    c_tipo_distincion  varchar(100)                                                    not null,
    x_descripcion      varchar(300),
    f_distincion       date,
    x_documento        varchar(200),
    x_institucion      varchar(200),
    n_pais_id          bigint
        constraint fk_mov_ficha_dist_pais
            references mae_pais,
    n_anio             integer,
    x_ambito           varchar(100),
    n_puntaje          numeric(10, 3),
    n_archivo_id       bigint
        constraint fk_mov_ficha_dist_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_distincion
    owner to postgres;

grant insert, select, update on mov_ficha_distincion to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_distincion to uc_meritoapi_meritocracia;

create table mov_ficha_docencia
(
    n_ficha_docencia_id bigint     default nextval('meritocracia.useq_mov_ficha_docencia'::regclass) not null
        constraint pk_mov_ficha_docencia
            primary key,
    n_ficha_id         bigint                                                          not null
        constraint fk_mov_ficha_docencia_ficha
            references mov_ficha_valoracion,
    c_tipo_documento   varchar(30),
    n_universidad_id   bigint
        constraint fk_mov_ficha_docencia_univ
            references mae_universidad,
    x_universidad      varchar(200),
    n_horas_semanales  integer,
    f_inicio           date,
    f_fin              date,
    c_orden_juridico   varchar(15),
    x_especialidad     varchar(150),
    x_materia          varchar(150),
    x_categoria        varchar(50),
    x_condicion        varchar(50),
    n_puntaje          numeric(10, 3),
    n_archivo_id       bigint
        constraint fk_mov_ficha_docencia_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_docencia
    owner to postgres;

grant insert, select, update on mov_ficha_docencia to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_docencia to uc_meritoapi_meritocracia;

create table mov_ficha_demerito
(
    n_ficha_demerito_id bigint     default nextval('meritocracia.useq_mov_ficha_demerito'::regclass) not null
        constraint pk_mov_ficha_demerito
            primary key,
    n_ficha_id         bigint                                                          not null
        constraint fk_mov_ficha_demerito_ficha
            references mov_ficha_valoracion,
    c_tipo_medida      varchar(30)                                                     not null,
    n_cantidad         integer,
    c_tipo_documento   varchar(30),
    n_anio_valoracion  integer,
    x_observacion      varchar(300),
    n_puntaje          numeric(10, 3),
    n_archivo_id       bigint
        constraint fk_mov_ficha_demerito_archivo
            references mov_archivo,
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_demerito
    owner to postgres;

grant insert, select, update on mov_ficha_demerito to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_demerito to uc_meritoapi_meritocracia;

create table mov_ficha_evidencia
(
    n_ficha_evidencia_id bigint     default nextval('meritocracia.useq_mov_ficha_evidencia'::regclass) not null
        constraint pk_mov_ficha_evidencia
            primary key,
    n_ficha_id         bigint                                                          not null
        constraint fk_mov_ficha_evid_ficha
            references mov_ficha_valoracion,
    n_archivo_id       bigint                                                          not null
        constraint fk_mov_ficha_evid_archivo
            references mov_archivo,
    c_origen_tabla     varchar(40)                                                     not null,
    n_origen_id        bigint                                                          not null,
    n_rubro_id         bigint
        constraint fk_mov_ficha_evid_rubro
            references mae_rubro,
    f_inicio_vigencia  date,
    f_fin_vigencia     date,
    c_estado_vigencia  varchar(20),
    l_activo     varchar(1)  default '1'::character varying                            not null,
    f_registro   timestamp   default LOCALTIMESTAMP                                    not null,
    f_aud        timestamp   default LOCALTIMESTAMP                                    not null,
    b_aud        varchar(1)  default 'I'::character varying                            not null,
    c_aud_uid    varchar(30) default CURRENT_USER,
    c_aud_uidred varchar(30),
    c_aud_pc     varchar(30),
    c_aud_ip     varchar(40),
    c_aud_mcaddr varchar(17)
);

alter table mov_ficha_evidencia
    owner to postgres;

grant insert, select, update on mov_ficha_evidencia to uc_meritocraciaapi_meritocracia;

grant insert, select, update on mov_ficha_evidencia to uc_meritoapi_meritocracia;

-- ----- FUNCIONES DE AUDITORÍA -----
create function ufn_mae_nivel() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_nivel(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_nivel_id, c_nivel, x_nombre, n_orden, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_nivel'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_nivel_id, OLD.c_nivel, OLD.x_nombre, OLD.n_orden, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_nivel(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_nivel_id, c_nivel, x_nombre, n_orden, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_nivel'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_nivel_id, OLD.c_nivel, OLD.x_nombre, OLD.n_orden, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_nivel() owner to postgres;

grant execute on function ufn_mae_nivel() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_nivel() to uc_meritoapi_meritocracia;

create function ufn_mae_especialidad() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_especialidad(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_especialidad_id, c_especialidad, x_nombre, n_orden, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_especialidad'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_especialidad_id, OLD.c_especialidad, OLD.x_nombre, OLD.n_orden, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_especialidad(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_especialidad_id, c_especialidad, x_nombre, n_orden, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_especialidad'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_especialidad_id, OLD.c_especialidad, OLD.x_nombre, OLD.n_orden, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_especialidad() owner to postgres;

grant execute on function ufn_mae_especialidad() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_especialidad() to uc_meritoapi_meritocracia;

create function ufn_mae_universidad() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_universidad(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_universidad_id, x_nombre, c_codigo, n_pais_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_universidad'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_universidad_id, OLD.x_nombre, OLD.c_codigo, OLD.n_pais_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_universidad(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_universidad_id, x_nombre, c_codigo, n_pais_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_universidad'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_universidad_id, OLD.x_nombre, OLD.c_codigo, OLD.n_pais_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_universidad() owner to postgres;

grant execute on function ufn_mae_universidad() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_universidad() to uc_meritoapi_meritocracia;

create function ufn_mae_colegio_abogado() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_colegio_abogado(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_colegio_abog_id, x_nombre, c_sigla, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_colegio_abogado'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_colegio_abog_id, OLD.x_nombre, OLD.c_sigla, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_colegio_abogado(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_colegio_abog_id, x_nombre, c_sigla, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_colegio_abogado'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_colegio_abog_id, OLD.x_nombre, OLD.c_sigla, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_colegio_abogado() owner to postgres;

grant execute on function ufn_mae_colegio_abogado() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_colegio_abogado() to uc_meritoapi_meritocracia;

create function ufn_mae_rubro() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_rubro(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_rubro_id, c_rubro, x_nombre, n_orden, n_puntaje_max, n_anios_vigencia, l_suspendido, l_permite_negativo, l_excluye_desemp_meritos, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_rubro'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_rubro_id, OLD.c_rubro, OLD.x_nombre, OLD.n_orden, OLD.n_puntaje_max, OLD.n_anios_vigencia, OLD.l_suspendido, OLD.l_permite_negativo, OLD.l_excluye_desemp_meritos, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_rubro(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_rubro_id, c_rubro, x_nombre, n_orden, n_puntaje_max, n_anios_vigencia, l_suspendido, l_permite_negativo, l_excluye_desemp_meritos, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_rubro'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_rubro_id, OLD.c_rubro, OLD.x_nombre, OLD.n_orden, OLD.n_puntaje_max, OLD.n_anios_vigencia, OLD.l_suspendido, OLD.l_permite_negativo, OLD.l_excluye_desemp_meritos, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_rubro() owner to postgres;

grant execute on function ufn_mae_rubro() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_rubro() to uc_meritoapi_meritocracia;

create function ufn_mae_subrubro() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_subrubro(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_subrubro_id, n_rubro_id, c_subrubro, x_nombre, n_orden, n_puntaje_max, n_anios_vigencia, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_subrubro'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_subrubro_id, OLD.n_rubro_id, OLD.c_subrubro, OLD.x_nombre, OLD.n_orden, OLD.n_puntaje_max, OLD.n_anios_vigencia, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_subrubro(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_subrubro_id, n_rubro_id, c_subrubro, x_nombre, n_orden, n_puntaje_max, n_anios_vigencia, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_subrubro'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_subrubro_id, OLD.n_rubro_id, OLD.c_subrubro, OLD.x_nombre, OLD.n_orden, OLD.n_puntaje_max, OLD.n_anios_vigencia, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_subrubro() owner to postgres;

grant execute on function ufn_mae_subrubro() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_subrubro() to uc_meritoapi_meritocracia;

create function ufn_mae_regla_puntaje() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_regla_puntaje(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_regla_puntaje_id, n_rubro_id, n_subrubro_id, c_clave, x_descripcion, x_condicion, n_puntaje, n_puntaje_min, n_puntaje_max, n_anio_desde, n_anio_hasta, n_orden, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_regla_puntaje'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_regla_puntaje_id, OLD.n_rubro_id, OLD.n_subrubro_id, OLD.c_clave, OLD.x_descripcion, OLD.x_condicion, OLD.n_puntaje, OLD.n_puntaje_min, OLD.n_puntaje_max, OLD.n_anio_desde, OLD.n_anio_hasta, OLD.n_orden, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_regla_puntaje(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_regla_puntaje_id, n_rubro_id, n_subrubro_id, c_clave, x_descripcion, x_condicion, n_puntaje, n_puntaje_min, n_puntaje_max, n_anio_desde, n_anio_hasta, n_orden, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_regla_puntaje'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_regla_puntaje_id, OLD.n_rubro_id, OLD.n_subrubro_id, OLD.c_clave, OLD.x_descripcion, OLD.x_condicion, OLD.n_puntaje, OLD.n_puntaje_min, OLD.n_puntaje_max, OLD.n_anio_desde, OLD.n_anio_hasta, OLD.n_orden, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_regla_puntaje() owner to postgres;

grant execute on function ufn_mae_regla_puntaje() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_regla_puntaje() to uc_meritoapi_meritocracia;

create function ufn_mae_criterio_desempate() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_criterio_desempate(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_criterio_desemp_id, c_cuadro, c_nivel, n_orden, c_codigo, x_nombre, c_sentido, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_criterio_desempate'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_criterio_desemp_id, OLD.c_cuadro, OLD.c_nivel, OLD.n_orden, OLD.c_codigo, OLD.x_nombre, OLD.c_sentido, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_criterio_desempate(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_criterio_desemp_id, c_cuadro, c_nivel, n_orden, c_codigo, x_nombre, c_sentido, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_criterio_desempate'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_criterio_desemp_id, OLD.c_cuadro, OLD.c_nivel, OLD.n_orden, OLD.c_codigo, OLD.x_nombre, OLD.c_sentido, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_criterio_desempate() owner to postgres;

grant execute on function ufn_mae_criterio_desempate() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_criterio_desempate() to uc_meritoapi_meritocracia;

create function ufn_mae_lista() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_lista(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_lista_id, c_lista, x_nombre, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_lista'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_lista_id, OLD.c_lista, OLD.x_nombre, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_lista(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_lista_id, c_lista, x_nombre, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_lista'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_lista_id, OLD.c_lista, OLD.x_nombre, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_lista() owner to postgres;

grant execute on function ufn_mae_lista() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_lista() to uc_meritoapi_meritocracia;

create function ufn_mae_lista_valor() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_lista_valor(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_lista_valor_id, n_lista_id, c_valor, x_descripcion, n_orden, n_valor_num, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_lista_valor'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_lista_valor_id, OLD.n_lista_id, OLD.c_valor, OLD.x_descripcion, OLD.n_orden, OLD.n_valor_num, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_lista_valor(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_lista_valor_id, n_lista_id, c_valor, x_descripcion, n_orden, n_valor_num, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_lista_valor'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_lista_valor_id, OLD.n_lista_id, OLD.c_valor, OLD.x_descripcion, OLD.n_orden, OLD.n_valor_num, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_lista_valor() owner to postgres;

grant execute on function ufn_mae_lista_valor() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_lista_valor() to uc_meritoapi_meritocracia;

create function ufn_mae_idioma() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mae_idioma(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_idioma_id, x_nombre, c_tipo, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_idioma'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_idioma_id, OLD.x_nombre, OLD.c_tipo, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mae_idioma(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_idioma_id, x_nombre, c_tipo, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mae_idioma'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_idioma_id, OLD.x_nombre, OLD.c_tipo, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mae_idioma() owner to postgres;

grant execute on function ufn_mae_idioma() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mae_idioma() to uc_meritoapi_meritocracia;

create function ufn_mov_fecha_valoracion() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_fecha_valoracion(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_fecha_valoracion_id, n_anio, f_valoracion, x_resolucion, l_vigente, n_usuario_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_fecha_valoracion'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_fecha_valoracion_id, OLD.n_anio, OLD.f_valoracion, OLD.x_resolucion, OLD.l_vigente, OLD.n_usuario_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_fecha_valoracion(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_fecha_valoracion_id, n_anio, f_valoracion, x_resolucion, l_vigente, n_usuario_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_fecha_valoracion'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_fecha_valoracion_id, OLD.n_anio, OLD.f_valoracion, OLD.x_resolucion, OLD.l_vigente, OLD.n_usuario_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_fecha_valoracion() owner to postgres;

grant execute on function ufn_mov_fecha_valoracion() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_fecha_valoracion() to uc_meritoapi_meritocracia;

create function ufn_mov_magistrado() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_magistrado(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_magistrado_id, c_dni, x_apellido_paterno, x_apellido_materno, x_nombres, x_nombre_completo, f_nacimiento, c_sexo, n_nivel_id, n_distrito_jud_id, l_cesante, f_cese, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_magistrado'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_magistrado_id, OLD.c_dni, OLD.x_apellido_paterno, OLD.x_apellido_materno, OLD.x_nombres, OLD.x_nombre_completo, OLD.f_nacimiento, OLD.c_sexo, OLD.n_nivel_id, OLD.n_distrito_jud_id, OLD.l_cesante, OLD.f_cese, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_magistrado(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_magistrado_id, c_dni, x_apellido_paterno, x_apellido_materno, x_nombres, x_nombre_completo, f_nacimiento, c_sexo, n_nivel_id, n_distrito_jud_id, l_cesante, f_cese, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_magistrado'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_magistrado_id, OLD.c_dni, OLD.x_apellido_paterno, OLD.x_apellido_materno, OLD.x_nombres, OLD.x_nombre_completo, OLD.f_nacimiento, OLD.c_sexo, OLD.n_nivel_id, OLD.n_distrito_jud_id, OLD.l_cesante, OLD.f_cese, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_magistrado() owner to postgres;

grant execute on function ufn_mov_magistrado() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_magistrado() to uc_meritoapi_meritocracia;

create function ufn_mov_asignacion_registrador() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_asignacion_registrador(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_asignacion_id, n_magistrado_id, n_usuario_titular_id, n_usuario_suplente_id, c_observacion, x_observacion, f_inicio, f_fin, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_asignacion_registrador'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_asignacion_id, OLD.n_magistrado_id, OLD.n_usuario_titular_id, OLD.n_usuario_suplente_id, OLD.c_observacion, OLD.x_observacion, OLD.f_inicio, OLD.f_fin, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_asignacion_registrador(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_asignacion_id, n_magistrado_id, n_usuario_titular_id, n_usuario_suplente_id, c_observacion, x_observacion, f_inicio, f_fin, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_asignacion_registrador'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_asignacion_id, OLD.n_magistrado_id, OLD.n_usuario_titular_id, OLD.n_usuario_suplente_id, OLD.c_observacion, OLD.x_observacion, OLD.f_inicio, OLD.f_fin, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_asignacion_registrador() owner to postgres;

grant execute on function ufn_mov_asignacion_registrador() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_asignacion_registrador() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_valoracion() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_valoracion(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_id, n_magistrado_id, n_fecha_valoracion_id, n_nivel_id, n_distrito_jud_id, n_usuario_registrador_id, c_estado, x_cargo_titular, f_juramentacion, h_juramento, f_cese, f_reincorporacion, n_anios_titular, n_meses_titular, n_dias_titular, n_puntaje_antiguedad, n_especialidad1_id, n_especialidad2_id, n_puntaje_total, n_puntaje_sin_antig, n_puntaje_demeritos, n_posicion_antiguedad, n_orden_meritos, n_orden_antiguedad, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_valoracion'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_id, OLD.n_magistrado_id, OLD.n_fecha_valoracion_id, OLD.n_nivel_id, OLD.n_distrito_jud_id, OLD.n_usuario_registrador_id, OLD.c_estado, OLD.x_cargo_titular, OLD.f_juramentacion, OLD.h_juramento, OLD.f_cese, OLD.f_reincorporacion, OLD.n_anios_titular, OLD.n_meses_titular, OLD.n_dias_titular, OLD.n_puntaje_antiguedad, OLD.n_especialidad1_id, OLD.n_especialidad2_id, OLD.n_puntaje_total, OLD.n_puntaje_sin_antig, OLD.n_puntaje_demeritos, OLD.n_posicion_antiguedad, OLD.n_orden_meritos, OLD.n_orden_antiguedad, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_valoracion(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_id, n_magistrado_id, n_fecha_valoracion_id, n_nivel_id, n_distrito_jud_id, n_usuario_registrador_id, c_estado, x_cargo_titular, f_juramentacion, h_juramento, f_cese, f_reincorporacion, n_anios_titular, n_meses_titular, n_dias_titular, n_puntaje_antiguedad, n_especialidad1_id, n_especialidad2_id, n_puntaje_total, n_puntaje_sin_antig, n_puntaje_demeritos, n_posicion_antiguedad, n_orden_meritos, n_orden_antiguedad, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_valoracion'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_id, OLD.n_magistrado_id, OLD.n_fecha_valoracion_id, OLD.n_nivel_id, OLD.n_distrito_jud_id, OLD.n_usuario_registrador_id, OLD.c_estado, OLD.x_cargo_titular, OLD.f_juramentacion, OLD.h_juramento, OLD.f_cese, OLD.f_reincorporacion, OLD.n_anios_titular, OLD.n_meses_titular, OLD.n_dias_titular, OLD.n_puntaje_antiguedad, OLD.n_especialidad1_id, OLD.n_especialidad2_id, OLD.n_puntaje_total, OLD.n_puntaje_sin_antig, OLD.n_puntaje_demeritos, OLD.n_posicion_antiguedad, OLD.n_orden_meritos, OLD.n_orden_antiguedad, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_valoracion() owner to postgres;

grant execute on function ufn_mov_ficha_valoracion() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_valoracion() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_rubro_puntaje() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_rubro_puntaje(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_rubro_id, n_ficha_id, n_rubro_id, n_subrubro_id, n_puntaje_subtotal, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_rubro_puntaje'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_rubro_id, OLD.n_ficha_id, OLD.n_rubro_id, OLD.n_subrubro_id, OLD.n_puntaje_subtotal, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_rubro_puntaje(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_rubro_id, n_ficha_id, n_rubro_id, n_subrubro_id, n_puntaje_subtotal, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_rubro_puntaje'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_rubro_id, OLD.n_ficha_id, OLD.n_rubro_id, OLD.n_subrubro_id, OLD.n_puntaje_subtotal, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_rubro_puntaje() owner to postgres;

grant execute on function ufn_mov_ficha_rubro_puntaje() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_rubro_puntaje() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_cargo_anterior() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_cargo_anterior(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_cargo_ant_id, n_ficha_id, n_nivel_id, f_inicio, f_fin, n_anios, n_meses, n_dias, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_cargo_anterior'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_cargo_ant_id, OLD.n_ficha_id, OLD.n_nivel_id, OLD.f_inicio, OLD.f_fin, OLD.n_anios, OLD.n_meses, OLD.n_dias, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_cargo_anterior(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_cargo_ant_id, n_ficha_id, n_nivel_id, f_inicio, f_fin, n_anios, n_meses, n_dias, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_cargo_anterior'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_cargo_ant_id, OLD.n_ficha_id, OLD.n_nivel_id, OLD.f_inicio, OLD.f_fin, OLD.n_anios, OLD.n_meses, OLD.n_dias, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_cargo_anterior() owner to postgres;

grant execute on function ufn_mov_ficha_cargo_anterior() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_cargo_anterior() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_provisionalidad() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_provisionalidad(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_provis_id, n_ficha_id, f_inicio, f_fin, n_anios, n_meses, n_dias, c_cargo, x_organo_jurisdiccional, x_documento, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_provisionalidad'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_provis_id, OLD.n_ficha_id, OLD.f_inicio, OLD.f_fin, OLD.n_anios, OLD.n_meses, OLD.n_dias, OLD.c_cargo, OLD.x_organo_jurisdiccional, OLD.x_documento, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_provisionalidad(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_provis_id, n_ficha_id, f_inicio, f_fin, n_anios, n_meses, n_dias, c_cargo, x_organo_jurisdiccional, x_documento, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_provisionalidad'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_provis_id, OLD.n_ficha_id, OLD.f_inicio, OLD.f_fin, OLD.n_anios, OLD.n_meses, OLD.n_dias, OLD.c_cargo, OLD.x_organo_jurisdiccional, OLD.x_documento, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_provisionalidad() owner to postgres;

grant execute on function ufn_mov_ficha_provisionalidad() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_provisionalidad() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_colegiatura() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_colegiatura(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_coleg_id, n_ficha_id, n_colegio_abog_id, f_colegiatura, n_anios_colegiatura, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_colegiatura'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_coleg_id, OLD.n_ficha_id, OLD.n_colegio_abog_id, OLD.f_colegiatura, OLD.n_anios_colegiatura, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_colegiatura(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_coleg_id, n_ficha_id, n_colegio_abog_id, f_colegiatura, n_anios_colegiatura, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_colegiatura'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_coleg_id, OLD.n_ficha_id, OLD.n_colegio_abog_id, OLD.f_colegiatura, OLD.n_anios_colegiatura, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_colegiatura() owner to postgres;

grant execute on function ufn_mov_ficha_colegiatura() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_colegiatura() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_grado_titulo() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_grado_titulo(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_grado_id, n_ficha_id, c_nivel_grado, n_universidad_id, x_universidad, n_pais_id, f_obtencion, x_especialidad, x_mencion, x_observacion, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_grado_titulo'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_grado_id, OLD.n_ficha_id, OLD.c_nivel_grado, OLD.n_universidad_id, OLD.x_universidad, OLD.n_pais_id, OLD.f_obtencion, OLD.x_especialidad, OLD.x_mencion, OLD.x_observacion, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_grado_titulo(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_grado_id, n_ficha_id, c_nivel_grado, n_universidad_id, x_universidad, n_pais_id, f_obtencion, x_especialidad, x_mencion, x_observacion, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_grado_titulo'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_grado_id, OLD.n_ficha_id, OLD.c_nivel_grado, OLD.n_universidad_id, OLD.x_universidad, OLD.n_pais_id, OLD.f_obtencion, OLD.x_especialidad, OLD.x_mencion, OLD.x_observacion, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_grado_titulo() owner to postgres;

grant execute on function ufn_mov_ficha_grado_titulo() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_grado_titulo() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_amag() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_amag(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_amag_id, n_ficha_id, c_tipo_curso, n_nota, x_descripcion, n_anio_curso, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_amag'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_amag_id, OLD.n_ficha_id, OLD.c_tipo_curso, OLD.n_nota, OLD.x_descripcion, OLD.n_anio_curso, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_amag(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_amag_id, n_ficha_id, c_tipo_curso, n_nota, x_descripcion, n_anio_curso, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_amag'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_amag_id, OLD.n_ficha_id, OLD.c_tipo_curso, OLD.n_nota, OLD.x_descripcion, OLD.n_anio_curso, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_amag() owner to postgres;

grant execute on function ufn_mov_ficha_amag() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_amag() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_estudio_posgrado() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_estudio_posgrado(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_est_pos_id, n_ficha_id, c_tipo, n_universidad_id, x_universidad, n_pais_id, c_orden_juridico, x_mencion, c_condicion_academica, n_num_semestre, n_anio_ini_sem, n_anio_fin_sem, x_notas_semestre, n_promedio_semestre, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_estudio_posgrado'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_est_pos_id, OLD.n_ficha_id, OLD.c_tipo, OLD.n_universidad_id, OLD.x_universidad, OLD.n_pais_id, OLD.c_orden_juridico, OLD.x_mencion, OLD.c_condicion_academica, OLD.n_num_semestre, OLD.n_anio_ini_sem, OLD.n_anio_fin_sem, OLD.x_notas_semestre, OLD.n_promedio_semestre, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_estudio_posgrado(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_est_pos_id, n_ficha_id, c_tipo, n_universidad_id, x_universidad, n_pais_id, c_orden_juridico, x_mencion, c_condicion_academica, n_num_semestre, n_anio_ini_sem, n_anio_fin_sem, x_notas_semestre, n_promedio_semestre, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_estudio_posgrado'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_est_pos_id, OLD.n_ficha_id, OLD.c_tipo, OLD.n_universidad_id, OLD.x_universidad, OLD.n_pais_id, OLD.c_orden_juridico, OLD.x_mencion, OLD.c_condicion_academica, OLD.n_num_semestre, OLD.n_anio_ini_sem, OLD.n_anio_fin_sem, OLD.x_notas_semestre, OLD.n_promedio_semestre, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_estudio_posgrado() owner to postgres;

grant execute on function ufn_mov_ficha_estudio_posgrado() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_estudio_posgrado() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_pasantia() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_pasantia(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_pasantia_id, n_ficha_id, c_tipo, x_institucion, n_nota, n_pais_id, f_inicio, f_fin, l_juridico, x_especialidad, x_mencion, n_horas, x_realizado_en, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_pasantia'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_pasantia_id, OLD.n_ficha_id, OLD.c_tipo, OLD.x_institucion, OLD.n_nota, OLD.n_pais_id, OLD.f_inicio, OLD.f_fin, OLD.l_juridico, OLD.x_especialidad, OLD.x_mencion, OLD.n_horas, OLD.x_realizado_en, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_pasantia(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_pasantia_id, n_ficha_id, c_tipo, x_institucion, n_nota, n_pais_id, f_inicio, f_fin, l_juridico, x_especialidad, x_mencion, n_horas, x_realizado_en, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_pasantia'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_pasantia_id, OLD.n_ficha_id, OLD.c_tipo, OLD.x_institucion, OLD.n_nota, OLD.n_pais_id, OLD.f_inicio, OLD.f_fin, OLD.l_juridico, OLD.x_especialidad, OLD.x_mencion, OLD.n_horas, OLD.x_realizado_en, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_pasantia() owner to postgres;

grant execute on function ufn_mov_ficha_pasantia() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_pasantia() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_curso_espec() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_curso_espec(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_curso_id, n_ficha_id, x_tipo_curso, c_orden_juridico, x_nombre_curso, x_institucion, n_pais_id, f_inicio, f_fin, x_especialidad, n_horas, n_nota, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_curso_espec'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_curso_id, OLD.n_ficha_id, OLD.x_tipo_curso, OLD.c_orden_juridico, OLD.x_nombre_curso, OLD.x_institucion, OLD.n_pais_id, OLD.f_inicio, OLD.f_fin, OLD.x_especialidad, OLD.n_horas, OLD.n_nota, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_curso_espec(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_curso_id, n_ficha_id, x_tipo_curso, c_orden_juridico, x_nombre_curso, x_institucion, n_pais_id, f_inicio, f_fin, x_especialidad, n_horas, n_nota, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_curso_espec'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_curso_id, OLD.n_ficha_id, OLD.x_tipo_curso, OLD.c_orden_juridico, OLD.x_nombre_curso, OLD.x_institucion, OLD.n_pais_id, OLD.f_inicio, OLD.f_fin, OLD.x_especialidad, OLD.n_horas, OLD.n_nota, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_curso_espec() owner to postgres;

grant execute on function ufn_mov_ficha_curso_espec() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_curso_espec() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_certamen() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_certamen(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_certamen_id, n_ficha_id, c_tipo_certamen, c_tipo_participacion, c_orden_juridico, x_especialidad, x_tema, x_institucion, n_pais_id, f_inicio, f_fin, c_modalidad, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_certamen'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_certamen_id, OLD.n_ficha_id, OLD.c_tipo_certamen, OLD.c_tipo_participacion, OLD.c_orden_juridico, OLD.x_especialidad, OLD.x_tema, OLD.x_institucion, OLD.n_pais_id, OLD.f_inicio, OLD.f_fin, OLD.c_modalidad, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_certamen(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_certamen_id, n_ficha_id, c_tipo_certamen, c_tipo_participacion, c_orden_juridico, x_especialidad, x_tema, x_institucion, n_pais_id, f_inicio, f_fin, c_modalidad, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_certamen'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_certamen_id, OLD.n_ficha_id, OLD.c_tipo_certamen, OLD.c_tipo_participacion, OLD.c_orden_juridico, OLD.x_especialidad, OLD.x_tema, OLD.x_institucion, OLD.n_pais_id, OLD.f_inicio, OLD.f_fin, OLD.c_modalidad, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_certamen() owner to postgres;

grant execute on function ufn_mov_ficha_certamen() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_certamen() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_evento() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_evento(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_evento_id, n_ficha_id, c_tipo_evento, c_orden_juridico, x_especialidad, x_tema, x_institucion, n_pais_id, f_inicio, f_fin, c_modalidad, c_tipo_documento, x_ambito, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_evento'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_evento_id, OLD.n_ficha_id, OLD.c_tipo_evento, OLD.c_orden_juridico, OLD.x_especialidad, OLD.x_tema, OLD.x_institucion, OLD.n_pais_id, OLD.f_inicio, OLD.f_fin, OLD.c_modalidad, OLD.c_tipo_documento, OLD.x_ambito, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_evento(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_evento_id, n_ficha_id, c_tipo_evento, c_orden_juridico, x_especialidad, x_tema, x_institucion, n_pais_id, f_inicio, f_fin, c_modalidad, c_tipo_documento, x_ambito, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_evento'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_evento_id, OLD.n_ficha_id, OLD.c_tipo_evento, OLD.c_orden_juridico, OLD.x_especialidad, OLD.x_tema, OLD.x_institucion, OLD.n_pais_id, OLD.f_inicio, OLD.f_fin, OLD.c_modalidad, OLD.c_tipo_documento, OLD.x_ambito, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_evento() owner to postgres;

grant execute on function ufn_mov_ficha_evento() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_evento() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_ofimatica() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_ofimatica(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_ofim_id, n_ficha_id, x_nombre_curso, x_institucion, n_horas, c_nivel, c_tipo_documento, f_obtencion, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_ofimatica'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_ofim_id, OLD.n_ficha_id, OLD.x_nombre_curso, OLD.x_institucion, OLD.n_horas, OLD.c_nivel, OLD.c_tipo_documento, OLD.f_obtencion, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_ofimatica(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_ofim_id, n_ficha_id, x_nombre_curso, x_institucion, n_horas, c_nivel, c_tipo_documento, f_obtencion, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_ofimatica'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_ofim_id, OLD.n_ficha_id, OLD.x_nombre_curso, OLD.x_institucion, OLD.n_horas, OLD.c_nivel, OLD.c_tipo_documento, OLD.f_obtencion, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_ofimatica() owner to postgres;

grant execute on function ufn_mov_ficha_ofimatica() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_ofimatica() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_idioma() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_idioma(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_idioma_id, n_ficha_id, c_tipo_idioma, n_idioma_id, x_idioma, x_institucion, n_duracion_meses, c_nivel, c_tipo_documento, f_obtencion, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_idioma'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_idioma_id, OLD.n_ficha_id, OLD.c_tipo_idioma, OLD.n_idioma_id, OLD.x_idioma, OLD.x_institucion, OLD.n_duracion_meses, OLD.c_nivel, OLD.c_tipo_documento, OLD.f_obtencion, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_idioma(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_idioma_id, n_ficha_id, c_tipo_idioma, n_idioma_id, x_idioma, x_institucion, n_duracion_meses, c_nivel, c_tipo_documento, f_obtencion, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_idioma'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_idioma_id, OLD.n_ficha_id, OLD.c_tipo_idioma, OLD.n_idioma_id, OLD.x_idioma, OLD.x_institucion, OLD.n_duracion_meses, OLD.c_nivel, OLD.c_tipo_documento, OLD.f_obtencion, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_idioma() owner to postgres;

grant execute on function ufn_mov_ficha_idioma() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_idioma() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_publicacion() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_publicacion(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_publ_id, n_ficha_id, c_tipo_publicacion, x_titulo, x_editorial, n_paginas, x_num_edicion, x_auspicio, n_pais_id, n_anio, c_orden_juridico, x_especialidad, x_institucion, f_publicacion, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_publicacion'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_publ_id, OLD.n_ficha_id, OLD.c_tipo_publicacion, OLD.x_titulo, OLD.x_editorial, OLD.n_paginas, OLD.x_num_edicion, OLD.x_auspicio, OLD.n_pais_id, OLD.n_anio, OLD.c_orden_juridico, OLD.x_especialidad, OLD.x_institucion, OLD.f_publicacion, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_publicacion(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_publ_id, n_ficha_id, c_tipo_publicacion, x_titulo, x_editorial, n_paginas, x_num_edicion, x_auspicio, n_pais_id, n_anio, c_orden_juridico, x_especialidad, x_institucion, f_publicacion, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_publicacion'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_publ_id, OLD.n_ficha_id, OLD.c_tipo_publicacion, OLD.x_titulo, OLD.x_editorial, OLD.n_paginas, OLD.x_num_edicion, OLD.x_auspicio, OLD.n_pais_id, OLD.n_anio, OLD.c_orden_juridico, OLD.x_especialidad, OLD.x_institucion, OLD.f_publicacion, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_publicacion() owner to postgres;

grant execute on function ufn_mov_ficha_publicacion() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_publicacion() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_distincion() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_distincion(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_dist_id, n_ficha_id, c_tipo_distincion, x_descripcion, f_distincion, x_documento, x_institucion, n_pais_id, n_anio, x_ambito, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_distincion'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_dist_id, OLD.n_ficha_id, OLD.c_tipo_distincion, OLD.x_descripcion, OLD.f_distincion, OLD.x_documento, OLD.x_institucion, OLD.n_pais_id, OLD.n_anio, OLD.x_ambito, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_distincion(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_dist_id, n_ficha_id, c_tipo_distincion, x_descripcion, f_distincion, x_documento, x_institucion, n_pais_id, n_anio, x_ambito, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_distincion'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_dist_id, OLD.n_ficha_id, OLD.c_tipo_distincion, OLD.x_descripcion, OLD.f_distincion, OLD.x_documento, OLD.x_institucion, OLD.n_pais_id, OLD.n_anio, OLD.x_ambito, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_distincion() owner to postgres;

grant execute on function ufn_mov_ficha_distincion() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_distincion() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_docencia() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_docencia(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_docencia_id, n_ficha_id, c_tipo_documento, n_universidad_id, x_universidad, n_horas_semanales, f_inicio, f_fin, c_orden_juridico, x_especialidad, x_materia, x_categoria, x_condicion, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_docencia'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_docencia_id, OLD.n_ficha_id, OLD.c_tipo_documento, OLD.n_universidad_id, OLD.x_universidad, OLD.n_horas_semanales, OLD.f_inicio, OLD.f_fin, OLD.c_orden_juridico, OLD.x_especialidad, OLD.x_materia, OLD.x_categoria, OLD.x_condicion, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_docencia(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_docencia_id, n_ficha_id, c_tipo_documento, n_universidad_id, x_universidad, n_horas_semanales, f_inicio, f_fin, c_orden_juridico, x_especialidad, x_materia, x_categoria, x_condicion, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_docencia'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_docencia_id, OLD.n_ficha_id, OLD.c_tipo_documento, OLD.n_universidad_id, OLD.x_universidad, OLD.n_horas_semanales, OLD.f_inicio, OLD.f_fin, OLD.c_orden_juridico, OLD.x_especialidad, OLD.x_materia, OLD.x_categoria, OLD.x_condicion, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_docencia() owner to postgres;

grant execute on function ufn_mov_ficha_docencia() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_docencia() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_demerito() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_demerito(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_demerito_id, n_ficha_id, c_tipo_medida, n_cantidad, c_tipo_documento, n_anio_valoracion, x_observacion, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_demerito'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_demerito_id, OLD.n_ficha_id, OLD.c_tipo_medida, OLD.n_cantidad, OLD.c_tipo_documento, OLD.n_anio_valoracion, OLD.x_observacion, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_demerito(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_demerito_id, n_ficha_id, c_tipo_medida, n_cantidad, c_tipo_documento, n_anio_valoracion, x_observacion, n_puntaje, n_archivo_id, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_demerito'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_demerito_id, OLD.n_ficha_id, OLD.c_tipo_medida, OLD.n_cantidad, OLD.c_tipo_documento, OLD.n_anio_valoracion, OLD.x_observacion, OLD.n_puntaje, OLD.n_archivo_id, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_demerito() owner to postgres;

grant execute on function ufn_mov_ficha_demerito() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_demerito() to uc_meritoapi_meritocracia;

create function ufn_mov_ficha_evidencia() returns trigger
    language plpgsql
as
$$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_evidencia(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_evidencia_id, n_ficha_id, n_archivo_id, c_origen_tabla, n_origen_id, n_rubro_id, f_inicio_vigencia, f_fin_vigencia, c_estado_vigencia, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_evidencia'), CURRENT_TIMESTAMP, 'D', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_evidencia_id, OLD.n_ficha_id, OLD.n_archivo_id, OLD.c_origen_tabla, OLD.n_origen_id, OLD.n_rubro_id, OLD.f_inicio_vigencia, OLD.f_fin_vigencia, OLD.c_estado_vigencia, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO meritocracia.aud_mov_ficha_evidencia(
            n_trns_id, f_trns, b_trns, c_trns_uid, c_trns_pc, n_trns_ip, c_trns_mcaddr,
            n_ficha_evidencia_id, n_ficha_id, n_archivo_id, c_origen_tabla, n_origen_id, n_rubro_id, f_inicio_vigencia, f_fin_vigencia, c_estado_vigencia, l_activo, f_registro, f_aud, b_aud, c_aud_uid, c_aud_uidred, c_aud_pc, c_aud_ip, c_aud_mcaddr
        ) VALUES (
            nextval('meritocracia.useq_aud_mov_ficha_evidencia'), CURRENT_TIMESTAMP, 'U', session_user, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr,
            OLD.n_ficha_evidencia_id, OLD.n_ficha_id, OLD.n_archivo_id, OLD.c_origen_tabla, OLD.n_origen_id, OLD.n_rubro_id, OLD.f_inicio_vigencia, OLD.f_fin_vigencia, OLD.c_estado_vigencia, OLD.l_activo, OLD.f_registro, OLD.f_aud, OLD.b_aud, OLD.c_aud_uid, OLD.c_aud_uidred, OLD.c_aud_pc, OLD.c_aud_ip, OLD.c_aud_mcaddr
        );
        RETURN OLD;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

alter function ufn_mov_ficha_evidencia() owner to postgres;

grant execute on function ufn_mov_ficha_evidencia() to uc_meritocraciaapi_meritocracia;

grant execute on function ufn_mov_ficha_evidencia() to uc_meritoapi_meritocracia;

-- ----- TRIGGERS DE AUDITORÍA -----
create trigger trg_mae_nivel
    after update or delete
    on mae_nivel
    for each row
execute procedure ufn_mae_nivel();

create trigger trg_mae_especialidad
    after update or delete
    on mae_especialidad
    for each row
execute procedure ufn_mae_especialidad();

create trigger trg_mae_universidad
    after update or delete
    on mae_universidad
    for each row
execute procedure ufn_mae_universidad();

create trigger trg_mae_colegio_abogado
    after update or delete
    on mae_colegio_abogado
    for each row
execute procedure ufn_mae_colegio_abogado();

create trigger trg_mae_rubro
    after update or delete
    on mae_rubro
    for each row
execute procedure ufn_mae_rubro();

create trigger trg_mae_subrubro
    after update or delete
    on mae_subrubro
    for each row
execute procedure ufn_mae_subrubro();

create trigger trg_mae_regla_puntaje
    after update or delete
    on mae_regla_puntaje
    for each row
execute procedure ufn_mae_regla_puntaje();

create trigger trg_mae_criterio_desempate
    after update or delete
    on mae_criterio_desempate
    for each row
execute procedure ufn_mae_criterio_desempate();

create trigger trg_mae_lista
    after update or delete
    on mae_lista
    for each row
execute procedure ufn_mae_lista();

create trigger trg_mae_lista_valor
    after update or delete
    on mae_lista_valor
    for each row
execute procedure ufn_mae_lista_valor();

create trigger trg_mae_idioma
    after update or delete
    on mae_idioma
    for each row
execute procedure ufn_mae_idioma();

create trigger trg_mov_fecha_valoracion
    after update or delete
    on mov_fecha_valoracion
    for each row
execute procedure ufn_mov_fecha_valoracion();

create trigger trg_mov_magistrado
    after update or delete
    on mov_magistrado
    for each row
execute procedure ufn_mov_magistrado();

create trigger trg_mov_asignacion_registrador
    after update or delete
    on mov_asignacion_registrador
    for each row
execute procedure ufn_mov_asignacion_registrador();

create trigger trg_mov_ficha_valoracion
    after update or delete
    on mov_ficha_valoracion
    for each row
execute procedure ufn_mov_ficha_valoracion();

create trigger trg_mov_ficha_rubro_puntaje
    after update or delete
    on mov_ficha_rubro_puntaje
    for each row
execute procedure ufn_mov_ficha_rubro_puntaje();

create trigger trg_mov_ficha_cargo_anterior
    after update or delete
    on mov_ficha_cargo_anterior
    for each row
execute procedure ufn_mov_ficha_cargo_anterior();

create trigger trg_mov_ficha_provisionalidad
    after update or delete
    on mov_ficha_provisionalidad
    for each row
execute procedure ufn_mov_ficha_provisionalidad();

create trigger trg_mov_ficha_colegiatura
    after update or delete
    on mov_ficha_colegiatura
    for each row
execute procedure ufn_mov_ficha_colegiatura();

create trigger trg_mov_ficha_grado_titulo
    after update or delete
    on mov_ficha_grado_titulo
    for each row
execute procedure ufn_mov_ficha_grado_titulo();

create trigger trg_mov_ficha_amag
    after update or delete
    on mov_ficha_amag
    for each row
execute procedure ufn_mov_ficha_amag();

create trigger trg_mov_ficha_estudio_posgrado
    after update or delete
    on mov_ficha_estudio_posgrado
    for each row
execute procedure ufn_mov_ficha_estudio_posgrado();

create trigger trg_mov_ficha_pasantia
    after update or delete
    on mov_ficha_pasantia
    for each row
execute procedure ufn_mov_ficha_pasantia();

create trigger trg_mov_ficha_curso_espec
    after update or delete
    on mov_ficha_curso_espec
    for each row
execute procedure ufn_mov_ficha_curso_espec();

create trigger trg_mov_ficha_certamen
    after update or delete
    on mov_ficha_certamen
    for each row
execute procedure ufn_mov_ficha_certamen();

create trigger trg_mov_ficha_evento
    after update or delete
    on mov_ficha_evento
    for each row
execute procedure ufn_mov_ficha_evento();

create trigger trg_mov_ficha_ofimatica
    after update or delete
    on mov_ficha_ofimatica
    for each row
execute procedure ufn_mov_ficha_ofimatica();

create trigger trg_mov_ficha_idioma
    after update or delete
    on mov_ficha_idioma
    for each row
execute procedure ufn_mov_ficha_idioma();

create trigger trg_mov_ficha_publicacion
    after update or delete
    on mov_ficha_publicacion
    for each row
execute procedure ufn_mov_ficha_publicacion();

create trigger trg_mov_ficha_distincion
    after update or delete
    on mov_ficha_distincionfich
    for each row
execute procedure ufn_mov_ficha_distincion();

create trigger trg_mov_ficha_docencia
    after update or delete
    on mov_ficha_docencia
    for each row
execute procedure ufn_mov_ficha_docencia();

create trigger trg_mov_ficha_demerito
    after update or delete
    on mov_ficha_demerito
    for each row
execute procedure ufn_mov_ficha_demerito();

create trigger trg_mov_ficha_evidencia
    after update or delete
    on mov_ficha_evidencia
    for each row
execute procedure ufn_mov_ficha_evidencia();
