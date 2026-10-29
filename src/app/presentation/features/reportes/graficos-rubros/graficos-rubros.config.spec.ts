import {
  IndicadorDashboard,
  IndicadorDashboardRubro,
  INDICADORES_DASHBOARD_RUBROS,
} from '../../../../domain/models/dashboard-rubros.model';
import { kpisPestana, PESTANAS_DASHBOARD } from './graficos-rubros.config';

describe('graficos-rubros.config', () => {
  const datos: Partial<Record<IndicadorDashboardRubro, IndicadorDashboard>> = {
    sexo: { indicador: 'SEXO', descripcion: '', total: 120, series: [] },
    'estado-carrera': {
      indicador: 'ESTADO_CARRERA',
      descripcion: '',
      total: 120,
      series: [
        {
          serie: 'TOTAL',
          total: 120,
          items: [
            { clave: 'ACTIVO', etiqueta: 'Activos', cantidad: 100, porcentaje: 83.33 },
            { clave: 'CESANTE', etiqueta: 'Cesantes', cantidad: 20, porcentaje: 16.67 },
          ],
        },
      ],
    },
    'documentos-por-caducar': {
      indicador: 'DOCUMENTOS_POR_CADUCAR',
      descripcion: '',
      total: 120,
      series: [
        { serie: 'DOCUMENTOS', total: 14, items: [] },
        {
          serie: 'MAGISTRADOS',
          total: 120,
          items: [{ clave: 'CON', etiqueta: 'Con documentos', cantidad: 9, porcentaje: 7.5 }],
        },
      ],
    },
  };
  const obtener = (indicador: IndicadorDashboardRubro) => datos[indicador] ?? null;

  it('ubica cada indicador en exactamente una pestaña', () => {
    const ubicados = PESTANAS_DASHBOARD.flatMap((p) => p.indicadores).sort();
    expect(ubicados).toEqual(INDICADORES_DASHBOARD_RUBROS.map((i) => i.indicador).sort());
  });

  it('resume activos, cesantes y total en la pestaña de cesantes', () => {
    expect(kpisPestana('cesantes', obtener).map((k) => [k.etiqueta, k.valor])).toEqual([
      ['Activos', 100],
      ['Cesantes', 20],
      ['Total de magistrados', 120],
    ]);
  });

  it('destaca con alerta los documentos por caducar', () => {
    const [documentos, magistrados] = kpisPestana('proximos', obtener);
    expect(documentos).toMatchObject({ valor: 14, destacado: true, icono: 'warning_amber' });
    expect(magistrados).toMatchObject({ etiqueta: 'Con documentos', valor: 9 });
  });

  it('no muestra KPIs si el indicador no cargó', () => {
    expect(kpisPestana('vigencia', obtener)).toEqual([]);
  });
});
