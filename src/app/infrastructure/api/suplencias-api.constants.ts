/** Endpoints de suplencias de registrador (relativos a `environment.urlApi`). */
export const suplenciasEndpoints = {
  /** GET bandeja: `suplencias?registrador_titular_id=&dni=&con_suplente=&pagina=&tamanio=`. */
  LISTAR: 'suplencias',
  REGISTRADORES: 'suplencias/registradores',
  MOTIVOS: 'suplencias/motivos',
  /** PUT asignar/cambiar y DELETE retirar: `suplencias/{idFicha}`. */
  porFicha: (idFicha: string | number) =>
    `suplencias/${encodeURIComponent(String(idFicha).trim())}`,
} as const;
