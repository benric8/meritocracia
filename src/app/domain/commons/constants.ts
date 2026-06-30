// Se codifica según proyecto
export const constantes = {
    JWT_TOKEN: 'PW_TOKEN',
    JWT_TOKEN_NIVEL: 'PWTK_NVL',
    TOKEN_VALID_SEC: 'PW_EXP',
    REFRESH_TOKEN_VALID_SEC: 'PW_REF',
    DATETIME_NEW_TOKEN: 'PW_TNT',
    USUARIO: 'USR_PWS',
    USUARIO_CODIGO: 'USR_PWS_CO',
    USUARIO_OPCIONES: 'USR_PWS_OP',
    USUARIO_PERFIL: 'USR_PWS_PE',
    USUARIO_SALA: 'USR_PWS_SALA',
    AUDITORIA_IP: 'AUD_IP',
    AUDITORIA_PC: 'AUD_PC',
    AUDITORIA_MAC: 'AUD_MAC',
    RES_COD_EXITO: '0000',
    RES_COD_NO_DATA: '-1', //0000

    FORMATO_RESPONSE_JSON : 'json',
    FORMATO_RESPONSE_XML : 'xml',

    INDICADOR_SI: 'S',
    INDICADOR_NO: 'N',
};

export const tokenNiveles ={
  NIVEL_AUTH:'PW_TOKEN_BASIC',
  NIVEL_LOGIN: 'PW_TOKEN_LOGIN',
  NIVEL_OPCIONES: 'PW_TOKEN_OPCIONES_PERFIL'
}

// Valores por defecto de auditoría (RNF005).
// TEMPORAL: el navegador no puede obtener IP/PC/MAC reales; idealmente el
// backend los captura desde la petición. Se usan constantes hasta entonces.
export const auditoriaDefault = {
  IP: '172.34.12.71',
  PC: 'pc-oruizb',
  MAC: 'aa-bb-cc-dd-ee-ff',
};

export const mensajes = {
  MSG_RESP_NO_DATA: 'No se encontraron datos en la respuesta',
  MSG_RESP_NO_DATA_LIST: 'No se encontraron resultados',
  SWAL_TITLE_TOKEN_EXPIRA: "Autorización Expirada",
};

export const tipoBandeja ={
  POR_PROYECTAR : "POR_PROYECTAR",
  POR_VALIDAR : "POR_VALIDAR",
}

export const tipoValidacionProyecto ={
  VALIDAR : "VALIDAR",
  OBSERVAR : "OBSERVAR",
}
  