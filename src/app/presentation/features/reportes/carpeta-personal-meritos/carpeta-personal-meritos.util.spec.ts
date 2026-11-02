import { CarpetaPersonalMeritos } from '../../../../domain/models/carpeta-personal-meritos.model';
import { carpetaVista, tablaVista } from './carpeta-personal-meritos.util';

const carpeta: CarpetaPersonalMeritos = {
  idFicha: '40',
  fechaValoracion: '2026-12-31',
  fotoBase64: null,
  dni: '12345678',
  apellidosNombres: 'PEREZ GOMEZ JUAN CARLOS',
  sexo: 'Masculino',
  estadoCivil: null,
  fechaNacimiento: '1962-05-14',
  edad: 64,
  distritoJudicial: 'LIMA',
  despachoJudicial: null,
  cargo: 'JUEZ SUPERIOR',
  condicion: 'TITULAR',
  primeraEspecialidad: 'CIVIL',
  segundaEspecialidad: null,
  anexoTelefonico: null,
  correoInstitucional: 'jperez@pj.gob.pe',
  secciones: [
    {
      numero: 'I',
      titulo: 'PRODUCCIÓN JURISDICCIONAL',
      nota: 'Rubro suspendido conforme a la R.A. 031-2013-CE-PJ.',
      tablas: [],
    },
    {
      numero: 'V',
      titulo: 'ESTUDIOS DE PERFECCIONAMIENTO',
      nota: null,
      tablas: [
        { titulo: 'V.2 PASANTÍAS', columnas: ['TIPO'], anchos: [1], filas: [] },
        { titulo: 'V.3 CURSOS', columnas: ['CURSO'], anchos: [1], filas: [['A'], ['B']] },
      ],
    },
  ],
};

describe('carpeta-personal-meritos.util', () => {
  it('arma los datos del juez con "—" donde no hay dato', () => {
    const vista = carpetaVista(carpeta);

    expect(vista.nombre).toBe('Perez Gomez Juan Carlos');
    expect(vista.foto).toBeNull();
    expect(vista.valoradoAl).toBe('31/12/2026');
    expect(vista.personales.map((d) => d.valor)).toEqual([
      '12345678',
      'Masculino',
      '—',
      '14/05/1962',
      '64 años',
      '31/12/2026',
    ]);
    expect(vista.laborales).toContainEqual({ etiqueta: 'Despacho judicial', valor: '—' });
    // El correo no se pasa a nombre propio.
    expect(vista.laborales).toContainEqual({
      etiqueta: 'Correo institucional',
      valor: 'jperez@pj.gob.pe',
    });
  });

  it('la foto en Base64 va como data URL JPG', () => {
    expect(carpetaVista({ ...carpeta, fotoBase64: '/9j/AAA' }).foto).toBe(
      'data:image/jpeg;base64,/9j/AAA'
    );
  });

  it('cuenta los documentos por rubro y separa el código del subrubro', () => {
    const [produccion, estudios] = carpetaVista(carpeta).secciones;

    expect(produccion).toMatchObject({ id: 'rubro-I', registros: 0, tablas: [] });
    expect(estudios.titulo).toBe('Estudios de perfeccionamiento');
    expect(estudios.registros).toBe(2);
    expect(estudios.tablas.map((t) => [t.codigo, t.titulo])).toEqual([
      ['V.2', 'Pasantías'],
      ['V.3', 'Cursos'],
    ]);
  });

  it('anchos en porcentaje y columnas angostas centradas', () => {
    const tabla = tablaVista({
      titulo: 'CRITERIOS DE DESEMPATE',
      columnas: ['CRITERIO', 'FEC. INICIO', 'AA'],
      anchos: [30, 15, 5],
      filas: [],
    });

    expect(tabla.codigo).toBeNull();
    expect(tabla.titulo).toBe('Criterios de desempate');
    expect(tabla.columnas).toEqual([
      { titulo: 'CRITERIO', ancho: 60, centrada: false },
      { titulo: 'FEC. INICIO', ancho: 30, centrada: false },
      { titulo: 'AA', ancho: 10, centrada: true },
    ]);
  });
});
